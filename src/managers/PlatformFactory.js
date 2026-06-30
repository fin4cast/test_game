export function createPlatforms(scene, platforms, staticGroup, movingGroup) {
  platforms.forEach(p => {
    if (p.moveX || p.moveY) {
      const plat = scene.physics.add.sprite(p.x, p.y, p.texture || 'platform_ground');
      plat.setDisplaySize(p.width, p.height);
      plat.body.setImmovable(true);
      plat.body.setAllowGravity(false);

      if (p.moveX) {
        scene.tweens.add({
          targets: plat,
          x: p.x + p.moveX,
          duration: p.duration || 2500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
      if (p.moveY) {
        scene.tweens.add({
          targets: plat,
          y: p.y + p.moveY,
          duration: p.duration || 2500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
      movingGroup.add(plat);
    } else {
      const plat = scene.add.tileSprite(p.x, p.y, p.width, p.height, p.texture || 'platform_ground');
      scene.physics.add.existing(plat, true);
      staticGroup.add(plat);
    }
  });
}
