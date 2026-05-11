/*
   This file is part of iros
   Copyright (C) 2025 Alex <uni@vrsal.xyz>

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU Affero General Public License as published
   by the Free Software Foundation, version 3 of the License.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU Affero General Public License for more details.

   You should have received a copy of the GNU Affero General Public License
   along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

const RESIZE_HANDLE_SIZE = 15;
const RESIZE_DETECTION_RADIUS = 20; // Larger radius for easier clicking

function draw_resize_handles(ctx, x, y, width, height, zoom, offset) {
  ctx.save();
  
  // Calculate screen positions
  // The editor normalizes mouse coords into world coordinates and the canvas
  // internal coordinate space matches world coords. Do not apply zoom/offset
  // here — draw using world coordinates so drawing matches hit-testing.
  let sx = x;
  let sy = y;
  let sw = width;
  let sh = height;

  // Draw outer rectangle
  ctx.strokeStyle = '#00ff00';
  ctx.lineWidth = 2;
  ctx.strokeRect(sx - 1, sy - 1, sw + 2, sh + 2);

  // Draw handles
  let handles = [
    { x: sx, y: sy },
    { x: sx + sw / 2, y: sy },
    { x: sx + sw, y: sy },
    { x: sx + sw, y: sy + sh / 2 },
    { x: sx + sw, y: sy + sh },
    { x: sx + sw / 2, y: sy + sh },
    { x: sx, y: sy + sh },
    { x: sx, y: sy + sh / 2 },
  ];

  ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;

  let size = RESIZE_HANDLE_SIZE / 2;
  handles.forEach(h => {
    ctx.fillRect(h.x - size, h.y - size, RESIZE_HANDLE_SIZE, RESIZE_HANDLE_SIZE);
    ctx.strokeRect(h.x - size, h.y - size, RESIZE_HANDLE_SIZE, RESIZE_HANDLE_SIZE);
  });

  ctx.restore();
}

function get_resize_handle_at_pos(x, y, width, height, zoom, offset, mouse_x, mouse_y) {
  // All coordinates should be in the same space (world coordinates from editor)
  let handles = [
    { x: x, y: y, name: 'tl' },
    { x: x + width / 2, y: y, name: 'tc' },
    { x: x + width, y: y, name: 'tr' },
    { x: x + width, y: y + height / 2, name: 'mr' },
    { x: x + width, y: y + height, name: 'br' },
    { x: x + width / 2, y: y + height, name: 'bc' },
    { x: x, y: y + height, name: 'bl' },
    { x: x, y: y + height / 2, name: 'ml' },
  ];

  for (let handle of handles) {
    let dist = Math.hypot(handle.x - mouse_x, handle.y - mouse_y);
    if (dist <= RESIZE_DETECTION_RADIUS) {
      return handle;
    }
  }

  return null;
}

function apply_resize(handle, dx, dy, element) {
  let tf = element.tf();

  switch (handle.name) {
    case 'tl':
      tf.x += dx;
      tf.y += dy;
      tf.width -= dx;
      tf.height -= dy;
      break;
    case 'tc':
      tf.y += dy;
      tf.height -= dy;
      break;
    case 'tr':
      tf.width += dx;
      tf.y += dy;
      tf.height -= dy;
      break;
    case 'mr':
      tf.width += dx;
      break;
    case 'br':
      tf.width += dx;
      tf.height += dy;
      break;
    case 'bc':
      tf.height += dy;
      break;
    case 'bl':
      tf.x += dx;
      tf.width -= dx;
      tf.height += dy;
      break;
    case 'ml':
      tf.x += dx;
      tf.width -= dx;
      break;
  }

  // Minimum size
  tf.width = Math.max(20, tf.width);
  tf.height = Math.max(20, tf.height);
}

