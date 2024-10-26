import * as Fs from "fs";
import * as Path from "path";
import { Util } from "./util";
import { Jimp } from "jimp";
import { ImageItem } from "./ImageItem";
import path = require("path");
import { getXmlStr } from "./xmlTemplet";

interface PointRecord {
    l: number,
    r: number,
    b: number,
}


export class Packer {
    packageByPath = async (inPath: string, outPath: string, name: string) => {
        const temp: ImageItem[] = []

        await Util.mapAllDirFile(inPath, async (path: string, fileName: string, curPath: string) => {
            const buffer = Fs.readFileSync(curPath);
            const image = await Jimp.read(buffer);


            let height = image.height;
            let width = image.width;

            let angle = false;

            if (width > height) {
                const temp = height;
                height = width;
                width = temp;
                angle = true;
            }

            const imageItem: ImageItem = {
                image: image,
                name: fileName,
                x: 0,
                y: 0,
                w: width,
                h: height,
                angle: angle
            };

            temp.push(imageItem);

            return true;
        })

        temp.sort((a, b) => {
            const aMaxW = a.w;
            const bMaxW = b.w;
            if (aMaxW > bMaxW) {
                return -1;
            } else if (aMaxW < bMaxW) {
                return 1;
            } else {
                return 0;
            }
        })

        const pointRecords: PointRecord[] = [];

        let bottom = 0;
        let top = 0;
        let right = 0;

        // 从前往后 只放一遍
        for (let i = 0; i < temp.length; i++) {
            const item = temp[i];
            if (i === 0) {
                top = item.h;
            }

            let bIn = false;

            for (let j = 0; j < pointRecords.length; j++) {
                const record = pointRecords[j];
                // 如果能放下就放进去，并将剩余空间切开
                if ((top - record.b) > item.h && (record.r - record.l) > item.w) {
                    const lRecord: PointRecord = {
                        l: record.l,
                        r: record.l + item.w,
                        b: record.b + item.h
                    };

                    const rRecord: PointRecord = {
                        l: record.l + item.w,
                        r: record.r,
                        b: record.b
                    };


                    item.x = record.l;
                    item.y = record.b;

                    pointRecords.splice(j, 1, lRecord, rRecord)

                    bIn = true;
                    break;
                }
            }

            if (bIn) {
            } else {
                // 放图片，并增加一个新的插槽
                item.x = right;
                item.y = bottom;

                const newRight = right + item.w

                if (top !== item.h) {
                    const newRecord: PointRecord = {
                        l: right,
                        r: newRight,
                        b: item.h
                    }; 
                    pointRecords.push(newRecord);
                }

                right = newRight;

            }

        }
        
        let newImage = new Jimp({ width: right, height: top });
        newImage.autocrop

        for (let i = 0; i < temp.length; i++) {
            const image = temp[i];
            newImage = newImage.composite(image.image, image.x, image.y);
        }

        const pngPath = path.join(outPath, name);
        await newImage.write(`${pngPath}.png`);

        const xmlStr = getXmlStr(name, right, top, temp);
        const pListPath = path.join(outPath, `${name}.plist`);
        Fs.writeFileSync(pListPath, xmlStr);

    }
}

try {
    new Packer().packageByPath('D://work//yh-core//images//ChooseUnit_img//image', 'D://work//yh-core//images//ChooseUnit_img//plist', 'ssss');
} catch (e) {
    console.log(e);
}

