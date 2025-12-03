import { base } from "$app/paths";
import thumb from './thumb.png'
import ThePond from "./thePond.svelte";
import { type ItemData, FileType } from "$lib/types";

export default {
    id: "THEPOND",
    image: thumb,
    title: "The Pond",
    subtitle: "Just some fishing",
    tags: ["webgpu", "game"].toSorted(),
    link: `${base}/experiments/thepond`,
    component: ThePond,
    type: FileType.Executable,
} as ItemData;
