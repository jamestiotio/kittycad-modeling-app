export const bracket = `const sigmaAllow = 15000 // psi
const width = 11 // inch
const p = 150 // Force on shelf - lbs
const distance = 12 // inches
const FOS = 2
const thickness = sqrt(distance * p * FOS * 6 / ( sigmaAllow * width ))
const filletR = thickness * 2
const shelfMountL = 9
const wallMountL = 8

const bracket = startSketchOn('XY')
  |> startProfileAt([0, 0], %)
  |> line([0, wallMountL], %)
  |> tangentialArc({
    radius: filletR,
    offset: 90
  }, %)
  |> line([-shelfMountL, 0], %)
  |> line([0, -thickness], %)
  |> line([shelfMountL, 0], %)
  |> tangentialArc({
    radius: filletR - thickness,
    offset: -90
  }, %)
  |> line([0, -wallMountL], %)
  |> close(%)
  |> extrude(width, %)

`
