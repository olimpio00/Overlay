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
var bttv_search_modal = null;
var bttv_cache = null;

$(document).ready(() => {
    bttv_search_modal = $("#bttv-search-modal");
    $("#bttv-search-input").on("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            search_bttv_emotes();
        }
    });
});

function search_bttv_emote(query) {
    return fetch(`https://api.betterttv.net/3/emotes/shared/search?query=${encodeURIComponent(query)}`, {
        credentials: "omit",
        method: "GET",
        mode: "cors"
    });
}

function process_bttv_search_result(data) {
    if (!Array.isArray(data)) throw new Error("No emotes found");
    return data.map((emote) => ({
        id: emote.id,
        code: emote.code,
        imageType: emote.imageType || "png",
        owner: emote.user ? (emote.user.displayName || emote.user.name || "") : "",
    }));
}

function add_bttv_emote(index) {
    let emote = bttv_cache[index];
    let url = `https://cdn.betterttv.net/emote/${emote.id}/3x`;
    let name = `${emote.code} ${edt.get_next_element_id()}`;
    add_image_element(url, name, 112, 112);
    close_modal();
}

function show_bttv_search_message(message) {
    let results = $("#bttv-search-results");
    results.innerHTML = "";
    let div = document.createElement("div");
    div.className = "emote-search-empty";
    div.textContent = message;
    results.appendChild(div);
}

function search_bttv_emotes() {
    $("#bttv-search-results").innerHTML = "";
    let search_input = $("#bttv-search-input");
    let query = search_input.value;
    if (query === "") return;
    search_input.enabled = false;
    document.body.style.cursor = "wait";
    search_bttv_emote(query).then((data) => {
        if (data.status === 400 || data.status === 404) return [];
        if (data.status !== 200) throw new Error("Invalid status code: " + data.status);
        if (data.ok !== true) throw new Error("Invalid status: " + data.statusText);
        return data.json();
    }).then(result => {
        search_input.enabled = true;
        let emotes = Array.isArray(result) ? process_bttv_search_result(result) : [];
        bttv_cache = emotes;
        if (emotes.length === 0) {
            show_bttv_search_message(`No BTTV emotes found for "${query}"`);
            return;
        }
        for (let i = 0; i < emotes.length; i++) {
            let emote = emotes[i];
            let div = document.createElement("div");
            div.className = "emote-search-result";
            div.innerHTML = `<div class="emote-search-result-image" style="background-image: url('https://cdn.betterttv.net/emote/${emote.id}/1x')"></div><div class="emote-search-result-name" title="${emote.code}">${emote.code}</div><div class="emote-search-result-owner" title="${emote.owner}">${emote.owner}</div>`;
            $(div).on("click", () => add_bttv_emote(i));
            $("#bttv-search-results").appendChild(div);
        }
    }).catch((err) => {
        search_input.enabled = true;
        console.error('[BTTV] search failed', err);
        show_bttv_search_message("Search failed. Try again.");
    }).finally(() => { document.body.style.cursor = "default"; });
}