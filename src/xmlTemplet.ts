import { ImageItem } from "./ImageItem"

export const getXmlStr = (name: string, w: number, h: number, items: ImageItem[]) => {
    const ret = 
`
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
    <dict>
        <key>frames</key>
        <dict>
            ${
                items.map(
                    (item) => {
                        return `
            <key>${item.name}</key>
            <dict>
                <key>aliases</key>
                <array/>
                <key>spriteOffset</key>
                <string>{0,0}</string>
                <key>spriteSize</key>
                <string>{${item.w},${item.h}}</string>
                <key>spriteSourceSize</key>
                <string>{${item.w},${item.h}}</string>
                <key>textureRect</key>
                <string>{{${item.x},${item.y}},{${item.w},${item.h}}}</string>
                <key>textureRotated</key>
                <${item.angle}/>
            </dict>`
                    }
                ).join('')
            }
        </dict>
        <key>metadata</key>
        <dict>
            <key>format</key>
            <integer>3</integer>
            <key>pixelFormat</key>
            <string>RGBA8888</string>
            <key>premultiplyAlpha</key>
            <false/>
            <key>realTextureFileName</key>
            <string>${name}.png</string>
            <key>size</key>
            <string>{${w},${h}}</string>
            <key>textureFileName</key>
            <string>${name}.png</string>
        </dict>
    </dict>
</plist>
`
    return ret
}