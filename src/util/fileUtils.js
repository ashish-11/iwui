export default class FileUtil {
    static openNewTab(url) {
        let a = window.document.createElement("a");
        a.target = '_blank';
        a.href = url;
        let e = window.document.createEvent("MouseEvents");
        e.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        a.dispatchEvent(e);
    }
}