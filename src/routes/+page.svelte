<script lang="ts">
  import { onMount } from "svelte";
  import { App } from "./thepond/control/app";

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




<h1>Projektarbeit WebGPU</h1>
<h2>Steuerung</h2>

<table>
  <thead>
    <tr>
      <th>Taste/Eingabe</th>
      <th>Aktion</th>
    </tr>
  </thead>
  <tbody>
    <tr class="mode-header">
      <td colspan="3">NORMALER MODUS</td>
    </tr>
    <tr>
      <td>A</td>
      <td>Bewegung nach links</td>
    </tr>
    <tr>
      <td>D</td>
      <td>Bewegung nach rechts</td>
    </tr>
    <tr>
      <td>C</td>
      <td>Toggle Debug Camera</td>
    </tr>
    <tr>
      <td>F</td>
      <td>Angel auswerfen</td>
    </tr>

    <tr class="mode-header">
      <td colspan="3">DEBUG MODUS</td>
    </tr>
    <tr>
      <td>W, A, S, D</td>
      <td>Bewegung vor, links, zurück, rechts</td>
    </tr>
    <tr>
      <td>Q</td>
      <td>Bewegung nach oben</td>
    </tr>
    <tr>
      <td>E</td>
      <td>Bewegung nach unten</td>
    </tr>
    <tr>
      <td>Maus</td>
      <td>Umschauen</td>
    </tr>
  </tbody>
</table>

<p>
  <b>INFO:</b> Beim Click in das Canvas element wird die Maus eingefangen um eine
  normale Steuerung im debug modus zu ermöglichen.
</p>

<h2>Game</h2>

<main class="flex mx-[1px]">
  <div class="min-h-screen p-8 space-y-10 overflow-hidden">
    {#if !gpuAvailable}
      <h2>WebGPU is not available in your browser, no fishing today :(</h2>
    {:else}
      <canvas
        bind:this={pond_canvas}
        id="gfx-main"
        width={1920 * 0.8}
        height={1080 * 0.8}
        tabindex="0"
      ></canvas>
    {/if}
  </div>
</main>

<style>
  
  * {
    font-family: sans-serif;
    margin: 20px;
  }
  h1 {
    color: #333;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }
  th,
  td {
    border: 1px solid #ddd;
    padding: 10px;
    text-align: left;
  }
  th {
    background-color: #f2f2f2;
    color: #333;
  }
  .mode-header {
    background-color: #e0e0e0;
    font-weight: bold;
  }
</style>
