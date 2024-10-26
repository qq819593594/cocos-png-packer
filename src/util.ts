import * as Fs from "fs";
import * as Path from "path";

export class Util {
    static mapAllDirFile = async (path: string, callBack: (path: string, fileName: string, curPath: string) => Promise<boolean>) => {
        if (!Fs.existsSync(path)) {
            throw('url not exit');
        }
        const files = Fs.readdirSync(path)
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            let curPath = Path.join(path, file);
            let stat = Fs.statSync(curPath);
            if (stat.isDirectory()) {
                await this.mapAllDirFile(curPath, callBack); // 遍历目录
            } else {
                const ret = await callBack(path, file, curPath);
                if (!ret) {
                    return false
                }
            }
        }
        return true;
    }
}