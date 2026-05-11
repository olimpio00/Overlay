/*
   This file is part of iros
   Copyright (C) 2024 Alex <uni@vrsal.xyz>

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

var player = null;
function embed_player() {
    let url = $("#embed-url").value;

    if (url.includes("youtube")) {
    } else if (url.includes("twitch")) {
        // extract channel name from url
        let splits = url.split("/");
        let channel = splits[splits.length - 1];
        if (channel !== "") {
            var options = {
                width: "100%",
                height: "100%",
                channel: channel,
                parent: [document.location.hostname],
                playsinline: true,
                muted: true,
                autoplay: true,
                lowLatency: true
            };
            $('#player').innerHTML = ""; // remove old embeds
            player = new Twitch.Player("player", options);
            player.addEventListener(Twitch.Player.READY, () => {
                try {
                    player.setMuted(false);
                    player.setVolume(0.2);
                    if (typeof player.seek === 'function' && typeof player.getDuration === 'function') {
                        let d = player.getDuration();
                        if (d && isFinite(d)) player.seek(d);
                    }
                } catch (e) {
                    console.warn('[embed] post-ready seek/volume failed', e);
                }
            });
        }
    }
    save_settings();
}