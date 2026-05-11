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

var image_upload_modal = null;
window.file_picker_active = false;

$(document).ready(() => {
  image_upload_modal = document.getElementById('image-upload-modal');
  
  let url_input = document.getElementById('image-upload-url-input');
  let file_input = document.getElementById('image-upload-file-input');
  let file_label = document.getElementById('image-upload-file-label');
  let url_button = document.getElementById('image-upload-url-button');
  let modal_container = document.getElementById('image-upload-container');

  // URL submission
  if (url_button) {
    url_button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('[IMAGE] URL button clicked');
      handle_image_url_submit();
    }, true);
  }
  
  // File input change - handle file selection
  if (file_input) {
    file_input.addEventListener('change', (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.file_picker_active = false;
      console.log('[IMAGE] File input change event, files:', file_input.files.length);
      if (file_input.files.length > 0) {
        handle_image_file_upload(file_input.files[0]);
      }
    }, true);
  }
  
  // URL input enter key
  if (url_input) {
    url_input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        handle_image_url_submit();
      }
    }, true);
  }

  // Drag and drop
  if (file_label) {
    file_label.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      file_label.classList.add('drag-over');
    }, true);

    file_label.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      file_label.classList.remove('drag-over');
    }, true);

    file_label.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      file_label.classList.remove('drag-over');
      
      if (e.dataTransfer.files.length > 0) {
        console.log('[IMAGE] File dropped');
        handle_image_file_upload(e.dataTransfer.files[0]);
      }
    }, true);

    // File label click - open file picker
    file_label.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('[IMAGE] Label clicked, opening file picker');
      window.file_picker_active = true;
      if (file_input) {
        file_input.click();
      }
      setTimeout(() => {
        window.file_picker_active = false;
      }, 100);
    }, true);
  }

  // Stop all propagation on modal container
  if (image_upload_modal) {
    image_upload_modal.addEventListener('click', (e) => {
      e.stopPropagation();
    }, true);
  }
});

function open_image_upload_modal() {
  open_modal(image_upload_modal);
  document.getElementById('image-upload-url-input').focus();
}

function handle_image_url_submit() {
  let url = document.getElementById('image-upload-url-input').value.trim();
  if (url === '') {
    alert('Please enter a valid URL');
    return;
  }
  
  url = normalize_url_input(url);
  add_image_element(url);
  close_modal();
  document.getElementById('image-upload-url-input').value = '';
}

function handle_image_file_upload(file) {
  if (!file) return;
  
  // Validate file type
  let valid_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
  let file_extension = file.name.split('.').pop().toLowerCase();
  
  if (!file.type.startsWith('image/') && !valid_extensions.includes(file_extension)) {
    alert('Please select a valid image file (JPG, PNG, GIF, WebP, BMP, SVG)');
    return;
  }
  
  let reader = new FileReader();
  
  reader.onload = (e) => {
    let data_url = e.target.result;
    let name = `Image ${edt.get_next_element_id()}`;
    add_image_element(data_url, name);
    close_modal();
    document.getElementById('image-upload-file-input').value = '';
  };
  
  reader.onerror = () => {
    alert('Error reading file. Please try again.');
    document.getElementById('image-upload-file-input').value = '';
  };
  
  reader.readAsDataURL(file);
}
