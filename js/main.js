// ----------------------------------------------------------------------------
let bodies = [
  { pos: { u0: 0, u1: -14 }, rot: 0, width: { u0: 100, u1: 20 } },
  { pos: { u0: 0, u1: 4 }, rot: 0, width: { u0: 1, u1: 1 } }
];

// ----------------------------------------------------------------------------
function main()
{
  let w = initWorld();
  let pi = initGl();

  let then = 0;

  function render(now)
  {
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;

    w.step(deltaTime);

    drawScene(pi, w.bodies);
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();