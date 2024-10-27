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


export default class Packer {
    packageByPath = async (inPath: string, outPath: string, name: string) => {
        const temp: ImageItem[] = []

        const names: string[] = [];
        const promiseArr: Promise<any>[] = [];
        Util.mapAllDirFile(inPath, (path: string, fileName: string, curPath: string) => {
            const buffer = Fs.readFileSync(curPath);
            const image = Jimp.read(buffer);
            names.push(fileName);
            promiseArr.push(image);

            return true;
        })

        const images = await Promise.all(promiseArr)

        for (let i = 0; i < images.length; i++) {
            const image = images[i];
            const name = names[i];
            
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
                name: name,
                x: 0,
                y: 0,
                w: width,
                h: height,
                angle: angle
            };

            temp.push(imageItem);
        }


        if (temp.length === 0) {
            return false;
        }

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
        let top = temp[0].h;
        let right = 0;

        const minItem = temp[temp.length - 1];

        // 从前往后 只放一遍
        for (let i = 0; i < temp.length; i++) {
            const item = temp[i];

            let bIn = false;

            for (let j = 0; j < pointRecords.length; j++) {
                const record = pointRecords[j];
                // 如果能放下就放进去，并将剩余空间切开
                if ((top - record.b) > item.h && (record.r - record.l) > item.w) {

                    const addArr: PointRecord[] = [];

                    const lBottom = record.b + item.h;

                    if ((lBottom + minItem.h) < top) {
                        addArr.push({
                            l: record.l,
                            r: record.l + item.w,
                            b: lBottom
                        })
                    }

                    const rLeft = record.l + item.w
                    if ((rLeft + minItem.w) < record.r) {
                        addArr.push({
                            l: rLeft,
                            r: record.r,
                            b: record.b
                        })
                    }


                    item.x = record.l;
                    item.y = record.b;

                    pointRecords.splice(j, 1, ...addArr)

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

        return true;

    }
}


