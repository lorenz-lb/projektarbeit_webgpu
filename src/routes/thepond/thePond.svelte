<script lang="ts">
  import { onMount } from "svelte";
  import { App } from "./control/app";

  let gpuAvailable: boolean = false;

  if (navigator.gpu) {
    gpuAvailable = true;
  }

  let pond_canvas: HTMLCanvasElement;
  let text_key: HTMLHeadElement;
  let text_mouse_x: HTMLHeadElement;
  let text_mouse_y: HTMLHeadElement;

  let app: App;

  onMount(async () => {
    app = new App(pond_canvas, [text_key, text_mouse_x, text_mouse_y]);
    app.startApp();
    //app.initialize().then(() => app.run());
  });
</script>

<main class="flex mx-[1px]">
  <div class="min-h-screen p-8 space-y-10 overflow-hidden">
    {#if !gpuAvailable}
      <h2>WebGPU is not available, no fishing today :(</h2>
    {:else}
      <h2>Lets go fishing!</h2>
      <canvas
        bind:this={pond_canvas}
        id="gfx-main"
        width={1920 * 0.8}
        height={1080 * 0.8}
        tabindex="0"
      ></canvas>
      <canvas id="debugCanvas" width={200} height={200}> </canvas>
      <div class="flex space-x-10">
        <p>Key:</p>
        <p bind:this={text_key}></p>
      </div>
      <div class="flex space-x-10">
        <p>Mouse X:</p>
        <p bind:this={text_mouse_x}></p>
      </div>
      <div class="flex space-x-10">
        <p>Mouse Y:</p>
        <p bind:this={text_mouse_y}></p>
      </div>
    {/if}
  </div>
</main>

<style>
  @import "$lib/components/ui95/assets/ui95.css";
</style>
