// ----------------------------------------------------------------------------
function main()
{
  let world = initWorld();

  let objs = [];
  objs.push(world.addStaticBody({ pos: { u0: 0, u1: -10 }, rot: 0, width: { u0: 100, u1: 20 } }));
  objs.push(world.addDynamicBody({ pos: { u0: 0, u1: 4 }, rot: 0, width: { u0: 1, u1: 1 }, mass: 200 }));
  objs.push(world.addDynamicBody({ pos: { u0: 0.4, u1: 6 }, rot: 0, width: { u0: 10, u1: 0.1 }, mass: 200 }));
  objs.push(world.addDynamicBody({ pos: { u0: -2, u1: 8 }, rot: 0, width: { u0: 0.5, u1: 0.5 }, mass: 50 }));
  objs.push(world.addDynamicBody({ pos: { u0: -3, u1: 8 }, rot: 0, width: { u0: 0.5, u1: 0.5 }, mass: 50 }));
  objs.push(world.addDynamicBody({ pos: { u0: 1, u1: 12 }, rot: 0, width: { u0: 1, u1: 1 }, mass: 200 }));

  let wgl = initGl();
  let prev_t_sec = 0;

  function render(t_msec)
  {
    const t_sec = t_msec * 0.001;
    const dt = t_sec - prev_t_sec;
    prev_t_sec = t_sec;

    for (let i = 0; i < 4; i++) {
      world.step(0.01);
    }

    drawScene(wgl, objs);
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();