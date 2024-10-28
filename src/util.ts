import * as Fs from "fs";
import * as Path from "path";

export class Util {
    static mapAllDirFile = (path: string, callBack: (path: string, fileName: string, curPath: string) => boolean) => {
        if (!Fs.existsSync(path)) {
            throw(`url: ${path} not exit`);
        }
        const files = Fs.readdirSync(path)
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            let curPath = Path.join(path, file);
            let stat = Fs.statSync(curPath);
            if (stat.isDirectory()) {
                this.mapAllDirFile(curPath, callBack); // 遍历目录
            } else {
                const ret = callBack(path, file, curPath);
                if (!ret) {
                    return false
                }
            }
        }
        return true;
    }
}