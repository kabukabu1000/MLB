// ==UserScript==
// @name         MLB.com GMT-5 to JST Converter
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  MLB.comの配信時間をGMT-5から日本時間(JST)に変換します
// @author       Your Name
// @match        https://www.mlb.com/live-stream-games*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 変換関数
    function convertToJST() {
        // GMT-5 のパターンを探す (例: 3:10 PM GMT-5)
        const timeRegex = /(\d{1,2}):(\d{2})\s?(AM|PM)\s?GMT-5/gi;

        // ページ内の全テキストノードを対象に走査
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        let node;

        while (node = walker.nextNode()) {
            if (timeRegex.test(node.nodeValue)) {
                node.nodeValue = node.nodeValue.replace(timeRegex, (match, hour, minute, ampm) => {
                    let h = parseInt(hour);
                    const m = minute;
                    const isPM = ampm.toUpperCase() === 'PM';

                    // 24時間制に変換
                    if (isPM && h !== 12) h += 12;
                    if (!isPM && h === 12) h = 0;

                    // GMT-5 から JST (GMT+9) への時差は +14時間
                    // 日付の跨ぎを考慮してDateオブジェクトを使用
                    const date = new Date(2000, 0, 1, h, m);
                    date.setHours(date.getHours() + 14);

                    const newH = date.getHours();
                    const newM = date.getMinutes().toString().padStart(2, '0');
                    const newAmPm = newH >= 12 ? 'PM' : 'AM';
                    const displayH = newH % 12 || 12;

                    return `${displayH}:${newM} ${newAmPm} JST`;
                });
            }
        }
    }

    // ページの読み込み時と、要素が追加された時に実行
    const observer = new MutationObserver(convertToJST);
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // 初回実行
    convertToJST();
})();