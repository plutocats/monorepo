import { buildSVG } from "@nouns/sdk";
import ImageData from "../seed/image-data.json";
import sharp from "sharp";

type Trait = {
    filename: string;
    data: string;
};

const INVALID_TYPE_ERROR = new Error("Invalid type");
const TRAIT_SIZE = 32;

const main = async () => {
    const { images, palette } = ImageData;
    const { eyes, glasses, heads, bodies, accessories } = images;

    const traits = [...eyes, ...glasses, ...heads, ...bodies, ...accessories];
    for (let i = 0; i < traits.length; i++) {
        let type = "";
        if (i < eyes.length) {
            type = 'eyes';
        }

        if (i >= eyes.length && i < eyes.length + glasses.length) {
            type = 'glasses';
        }

        if (i >= eyes.length + glasses.length && i < eyes.length + glasses.length + heads.length) {
            type = 'heads';
        }

        if (i >= eyes.length + glasses.length + heads.length && i < eyes.length + glasses.length + heads.length + bodies.length) {
            type = 'bodies';
        }

        if (i >= eyes.length + glasses.length + heads.length + bodies.length) {
            type = 'accessories';
        }

        if (type === "") {
            throw INVALID_TYPE_ERROR;
        }

        const t = traits[i];
        await savePNG(t, t.filename, type, palette);
    }
};

const savePNG = async (trait: Trait, name: string, type: string, palette: any) => {
    const svg = await buildSVG([trait], palette);
    const rootPath = './assets';
    const assetFolder = (() => {
        switch (type) {
            case 'bodies':
                return '1-bodies';
            case 'accessories':
                return '2-accessories';
            case 'heads':
                return '3-heads';
            case 'eyes':
                return '4-eyes';
            case 'glasses':
                return '5-glasses';
            default:
                throw INVALID_TYPE_ERROR;
        }
    })();

    const fullPath = `${rootPath}/${assetFolder}/`;
    await sharp(Buffer.from(svg, "utf-8")).resize(TRAIT_SIZE, TRAIT_SIZE, {
        kernel: 'nearest',
    }).toFormat('png').toFile(`${fullPath}${name}.png`);
};

main();