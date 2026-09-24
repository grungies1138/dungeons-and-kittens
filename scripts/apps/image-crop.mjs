/**
 * A lightweight square-crop tool for actor/item portraits, since core Foundry's FilePicker has
 * no cropping step of its own - it just lets you pick a file as-is.
 */

const MIN_BOX_SIZE = 40;
const OUTPUT_SIZE = 512;

/**
 * Open the crop dialog and, on confirm, upload the cropped result and assign it to `field`.
 * @param {Actor|Item} doc            The document to update once cropping is confirmed.
 * @param {string} [field="img"]      The document field to write the cropped image path to.
 * @param {string|null} [sourcePath]  Image to crop; defaults to the document's current value at `field`.
 * @returns {Promise<string|null>}    The uploaded image path, or null if cancelled.
 */
export async function openImageCropDialog(doc, field = "img", sourcePath = null) {
  const imgSrc = sourcePath ?? foundry.utils.getProperty(doc, field);
  const content = await renderTemplate("systems/dungeons-and-kittens/templates/apps/image-crop.html", { imgSrc });

  return new Promise(resolve => {
    let cropBox = null;
    /**
     * Foundry's Dialog calls the "close" option right after a button's own callback fires,
     * without waiting for that callback's async work to finish - so close's resolve(null) can
     * win the race against the crop button's resolve(path) if it isn't guarded. Marking
     * `resolved` synchronously, as the very first line of the crop callback (before any await),
     * closes that race: it's set before Foundry's close() runs its finally-block check.
     */
    let resolved = false;

    new Dialog({
      title: game.i18n.localize("DNK.CropImage"),
      content,
      buttons: {
        crop: {
          icon: '<i class="fas fa-crop"></i>',
          label: game.i18n.localize("DNK.CropAndSave"),
          callback: async () => {
            resolved = true;
            if (!cropBox) return resolve(null);
            const path = await cropAndUpload(cropBox, doc);
            if (path) await doc.update({ [field]: path });
            resolve(path);
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize("DNK.Cancel"),
          callback: () => { resolved = true; resolve(null); }
        }
      },
      default: "crop",
      render: html => { cropBox = activateCropBox(html[0]); },
      close: () => { cropBox?.destroy(); if (!resolved) resolve(null); }
    }, { width: 540 }).render(true);
  });
}

/** Wire up drag-to-move and drag-to-resize on the crop box overlay; returns a handle with getRect()/destroy(). */
function activateCropBox(root) {
  const imgEl = root.querySelector(".dnk-crop-image");
  const box = root.querySelector(".dnk-crop-box");
  const handle = root.querySelector(".dnk-crop-handle");

  function centerBox() {
    const w = imgEl.clientWidth, h = imgEl.clientHeight;
    const size = Math.min(w, h) * 0.8;
    box.style.width = `${size}px`;
    box.style.height = `${size}px`;
    box.style.left = `${(w - size) / 2}px`;
    box.style.top = `${(h - size) / 2}px`;
  }

  if (imgEl.complete && imgEl.naturalWidth) centerBox();
  else imgEl.addEventListener("load", centerBox, { once: true });

  let drag = null;

  const onBoxDown = ev => {
    if (ev.target === handle) return;
    ev.preventDefault();
    drag = { type: "move", startX: ev.clientX, startY: ev.clientY, left: box.offsetLeft, top: box.offsetTop };
  };
  const onHandleDown = ev => {
    ev.preventDefault();
    ev.stopPropagation();
    drag = { type: "resize", startX: ev.clientX, startY: ev.clientY, size: box.offsetWidth };
  };
  const onMove = ev => {
    if (!drag) return;
    const dx = ev.clientX - drag.startX;
    const dy = ev.clientY - drag.startY;
    const stageW = imgEl.clientWidth, stageH = imgEl.clientHeight;

    if (drag.type === "move") {
      const size = box.offsetWidth;
      const left = Math.max(0, Math.min(stageW - size, drag.left + dx));
      const top = Math.max(0, Math.min(stageH - size, drag.top + dy));
      box.style.left = `${left}px`;
      box.style.top = `${top}px`;
    } else {
      const maxSize = Math.min(stageW - box.offsetLeft, stageH - box.offsetTop);
      const size = Math.min(maxSize, Math.max(MIN_BOX_SIZE, drag.size + Math.max(dx, dy)));
      box.style.width = `${size}px`;
      box.style.height = `${size}px`;
    }
  };
  const onUp = () => { drag = null; };

  box.addEventListener("mousedown", onBoxDown);
  handle.addEventListener("mousedown", onHandleDown);
  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);

  return {
    getRect() {
      const scaleX = imgEl.naturalWidth / imgEl.clientWidth;
      const scaleY = imgEl.naturalHeight / imgEl.clientHeight;
      return {
        sx: box.offsetLeft * scaleX,
        sy: box.offsetTop * scaleY,
        sw: box.offsetWidth * scaleX,
        sh: box.offsetHeight * scaleY
      };
    },
    img: imgEl,
    destroy() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
  };
}

/** Draw the selected region to a fixed-size canvas and upload it as a new image file. */
async function cropAndUpload(cropBox, doc) {
  const { sx, sy, sw, sh } = cropBox.getRect();

  const canvasEl = window.document.createElement("canvas");
  canvasEl.width = OUTPUT_SIZE;
  canvasEl.height = OUTPUT_SIZE;
  canvasEl.getContext("2d").drawImage(cropBox.img, sx, sy, sw, sh, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

  const blob = await new Promise(resolve => canvasEl.toBlob(resolve, "image/webp", 0.92));
  if (!blob) return null;

  const targetDir = `worlds/${game.world.id}/dnk-portraits`;
  try { await FilePicker.createDirectory("data", targetDir); } catch (_err) { /* already exists */ }

  const file = new File([blob], `${doc.id}-portrait-${Date.now()}.webp`, { type: blob.type });
  const result = await FilePicker.upload("data", targetDir, file, {}, { notify: false });
  return result?.path ?? null;
}
