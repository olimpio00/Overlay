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

var audio_upload_modal = null;
var video_upload_modal = null;

function setup_media_upload(config) {
  let modal = document.getElementById(config.modal_id);
  let url_input = document.getElementById(config.url_input_id);
  let url_button = document.getElementById(config.url_button_id);
  let file_input = document.getElementById(config.file_input_id);
  let file_label = document.getElementById(config.file_label_id);

  if (url_button) {
    url_button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      submit_url();
    }, true);
  }

  if (url_input) {
    url_input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        submit_url();
      }
    }, true);
  }

  if (file_input) {
    file_input.addEventListener('change', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (file_input.files.length > 0) {
        submit_file(file_input.files[0]);
      }
    }, true);
  }

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
        submit_file(e.dataTransfer.files[0]);
      }
    }, true);

    file_label.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (file_input) file_input.click();
    }, true);
  }

  function submit_url() {
    let url = url_input.value.trim();
    if (url === '') {
      alert(`Please enter a valid ${config.label} URL`);
      return;
    }
    config.add_element(url);
    close_modal();
    url_input.value = '';
  }

  function submit_file(file) {
    if (!file) return;

    let valid_extensions = config.valid_extensions;
    let file_extension = file.name.split('.').pop().toLowerCase();

    if (!file.type.startsWith(config.mime_prefix) && !valid_extensions.includes(file_extension)) {
      alert(`Please select a valid ${config.label} file (${valid_extensions.join(', ').toUpperCase()})`);
      return;
    }

    let reader = new FileReader();
    reader.onload = (e) => {
      let data_url = e.target.result;
      let name = `${config.name_prefix} ${edt.get_next_element_id()}`;
      config.add_element(data_url, name);
      close_modal();
      file_input.value = '';
    };
    reader.onerror = () => {
      alert(`Error reading ${config.label} file. Please try again.`);
      file_input.value = '';
    };
    reader.readAsDataURL(file);
  }

  return modal;
}

$(document).ready(() => {
  audio_upload_modal = setup_media_upload({
    modal_id: 'audio-upload-modal',
    url_input_id: 'audio-upload-url-input',
    url_button_id: 'audio-upload-url-button',
    file_input_id: 'audio-upload-file-input',
    file_label_id: 'audio-upload-file-label',
    label: 'audio',
    name_prefix: 'Audio',
    mime_prefix: 'audio/',
    valid_extensions: ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac', 'opus', 'webm'],
    add_element: (url, name) => add_audio_element(url, name),
  });

  video_upload_modal = setup_media_upload({
    modal_id: 'video-upload-modal',
    url_input_id: 'video-upload-url-input',
    url_button_id: 'video-upload-url-button',
    file_input_id: 'video-upload-file-input',
    file_label_id: 'video-upload-file-label',
    label: 'video',
    name_prefix: 'Video',
    mime_prefix: 'video/',
    valid_extensions: ['mp4', 'webm', 'ogg', 'mov', 'mkv', 'avi', 'm4v'],
    add_element: (url, name) => add_video_element(url, name),
  });
});

function open_audio_upload_modal() {
  open_modal(audio_upload_modal);
  let input = document.getElementById('audio-upload-url-input');
  if (input) input.focus();
}

function open_video_upload_modal() {
  open_modal(video_upload_modal);
  let input = document.getElementById('video-upload-url-input');
  if (input) input.focus();
}
