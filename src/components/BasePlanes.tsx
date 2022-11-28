import { useState } from 'react'
import { DoubleSide } from 'three'
import { useStore } from '../useStore'
import { Intersection } from '@react-three/fiber'
import { addSketchTo, Program } from '../lang/abstractSyntaxTree'

const opacity = 0.1

export const BasePlanes = () => {
  const [axisIndex, setAxisIndex] = useState<null | number>(null)
  const { setGuiMode, guiMode, ast, updateAst } = useStore(
    ({ guiMode, setGuiMode, ast, updateAst }) => ({
      guiMode,
      setGuiMode,
      ast,
      updateAst,
    })
  )

  const onPointerEvent = ({
    intersections,
  }: {
    intersections: Intersection[]
  }) => {
    if (!intersections.length) {
      setAxisIndex(null)
      return
    }
    let closestIntersection = intersections[0]
    intersections.forEach((intersection) => {
      if (intersection.distance < closestIntersection.distance)
        closestIntersection = intersection
    })
    const smallestIndex = Number(closestIntersection.eventObject.name)
    setAxisIndex(smallestIndex)
  }
  const onClick = () => {
    if (guiMode.mode !== 'sketch') {
      return null
    }
    if (guiMode.sketchMode !== 'selectFace') {
      return null
    }

    let _ast: Program = ast
      ? ast
      : {
          type: 'Program',
          start: 0,
          end: 0,
          body: [],
        }
    const { modifiedAst, id } = addSketchTo(_ast)

    setGuiMode({
      mode: 'sketch',
      sketchMode: 'points',
      axis: axisIndex === 0 ? 'yz' : axisIndex === 1 ? 'xy' : 'xz',
      id,
    })

    updateAst(modifiedAst)
  }
  if (guiMode.mode !== 'sketch') {
    return null
  }
  if (guiMode.sketchMode !== 'selectFace') {
    return null
  }
  return (
    <>
      {Array.from({ length: 3 }).map((_, index) => (
        <mesh
          key={index}
          rotation-x={index === 1 ? -Math.PI / 2 : 0}
          rotation-y={index === 2 ? -Math.PI / 2 : 0}
          onPointerMove={onPointerEvent}
          onPointerOut={onPointerEvent}
          onClick={onClick}
          name={`${index}`}
        >
          <planeGeometry args={[5, 5]} />
          <meshStandardMaterial
            color="blue"
            side={DoubleSide}
            transparent
            opacity={opacity + (axisIndex === index ? 0.3 : 0)}
          />
        </mesh>
      ))}
    </>
  )
}
