import { useEffect, useRef } from 'react'
import './App.css'

function App() {
  // Store the canvas DOM element so the animation can draw directly into it.
  const canvasRef = useRef(null)

  useEffect(() => {
    // Set up the 2D drawing context and the values shared by the animation.
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    const flowerColors = ['#f26b5e', '#f7c948', '#e889b5', '#7bc6a4', '#a78bfa', '#ef8f4f', '#d85c8a', '#f3a6c8']
    const centerColors = ['#f8e28a', '#fff0a8', '#d98345', '#f6c1d5']
    let flowers = []
    let animationFrame
    let lastFlower = 0

    // Match the canvas's internal pixel dimensions to its displayed size.
    // The pixel ratio keeps the drawing sharp on high-density screens.
    const resize = () => {
      const pixelRatio = window.devicePixelRatio || 1
      const bounds = canvas.getBoundingClientRect()
      canvas.width = bounds.width * pixelRatio
      canvas.height = bounds.height * pixelRatio
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      flowers = []
    }

    // Draw one flower from its stem upward to its petals.
    // The flower's progress controls its growth animation.
    const drawFlower = (flower, now) => {
      const progress = Math.min((now - flower.createdAt) / 900, 1)
      const height = flower.height * progress
      const top = flower.ground - height
      const sway = Math.sin(now / 700 + flower.seed) * flower.sway * progress
      const scale = flower.scale * progress

      // Draw the gently curving stem.
      context.strokeStyle = '#4d8b68'
      context.lineWidth = 2 + scale
      context.beginPath()
      context.moveTo(flower.x, flower.ground)
      context.quadraticCurveTo(flower.x + sway, top + height * 0.45, flower.x + sway, top)
      context.stroke()

      // Draw two leaves at different points along the stem.
      context.fillStyle = '#68ad78'
      context.beginPath()
      context.ellipse(flower.x - 10 * scale, flower.ground - height * 0.42, 13 * scale, 5 * scale, -0.4, 0, Math.PI * 2)
      context.ellipse(flower.x + 10 * scale, flower.ground - height * 0.6, 13 * scale, 5 * scale, 0.4, 0, Math.PI * 2)
      context.fill()

      // Save and restore the canvas state so this flower's rotation and scale
      // do not affect the next flower drawn in the same frame.
      context.save()
      context.translate(flower.x + sway, top)
      context.rotate(flower.tilt)
      context.scale(scale, scale)
      context.fillStyle = flower.color
      for (let petal = 0; petal < flower.petals; petal += 1) {
        context.rotate((Math.PI * 2) / flower.petals)
        context.beginPath()
        const petalLength = flower.shape === 'star' ? 17 : flower.shape === 'round' ? 10 : 14
        const petalWidth = flower.shape === 'round' ? 9 : flower.shape === 'star' ? 4 : 7
        context.ellipse(0, -petalLength * 0.72, petalWidth, petalLength, flower.petalTilt, 0, Math.PI * 2)
        context.fill()
      }
      context.fillStyle = flower.centerColor
      context.beginPath()
      context.arc(0, 0, flower.centerSize, 0, Math.PI * 2)
      context.fill()
      context.restore()
    }

    // Draw a vine that climbs from one side of the canvas.
    // The side argument mirrors the same drawing logic for left and right vines.
    const drawVine = (side, vine, now, width, height) => {
      const progress = Math.min((now - vine.createdAt) / 5200, 1)
      const visibleHeight = height * 0.86 * progress
      const baseX = side === 'left' ? vine.offset : width - vine.offset
      const direction = side === 'left' ? 1 : -1
      const sway = Math.sin(now / 1500 + vine.seed) * 8

      // Draw the main climbing stem as a smooth Bezier curve.
      context.save()
      context.strokeStyle = '#397253'
      context.lineWidth = 3
      context.beginPath()
      context.moveTo(baseX, height)
      context.bezierCurveTo(
        baseX + direction * 20,
        height - visibleHeight * 0.3,
        baseX + direction * (sway - 18),
        height - visibleHeight * 0.68,
        baseX + direction * sway,
        height - visibleHeight,
      )
      context.stroke()

      // Place leaves at regular intervals along the part of the vine that has grown.
      const leaves = Math.floor(visibleHeight / 48)
      for (let leaf = 1; leaf <= leaves; leaf += 1) {
        const leafProgress = leaf / Math.max(leaves, 1)
        const leafY = height - visibleHeight * leafProgress
        const leafX = baseX + direction * (Math.sin(leaf * 1.8 + vine.seed) * 8)
        const leafSide = leaf % 2 === 0 ? -1 : 1

        context.fillStyle = leaf % 3 === 0 ? '#6eaa62' : '#4f925d'
        context.beginPath()
        context.ellipse(
          leafX + direction * leafSide * 10,
          leafY,
          11,
          5,
          direction * leafSide * 0.45,
          0,
          Math.PI * 2,
        )
        context.fill()
      }

      // Add two small blossoms to each vine after the vine reaches their height.
      vine.blooms.forEach((bloom, index) => {
        if (progress < bloom) return

        const bloomY = height - visibleHeight * bloom
        const bloomX = baseX + direction * (Math.sin(bloom * 8 + vine.seed) * 8)
        context.save()
        context.translate(bloomX, bloomY)
        context.rotate(direction * (0.15 + index * 0.12))
        context.scale(0.55, 0.55)
        context.fillStyle = index % 2 === 0 ? '#f29b9b' : '#f7c948'
        for (let petal = 0; petal < 5; petal += 1) {
          context.rotate((Math.PI * 2) / 5)
          context.beginPath()
          context.ellipse(0, -9, 6, 11, 0, 0, Math.PI * 2)
          context.fill()
        }
        context.fillStyle = '#fff0a8'
        context.beginPath()
        context.arc(0, 0, 5, 0, Math.PI * 2)
        context.fill()
        context.restore()
      })

      context.restore()
    }

    // Every animation frame clears the canvas and redraws the complete garden.
    const animate = (now) => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      // Keep the middle of the garden clear so flowers do not grow through the vines.
      const flowerMargin = Math.min(110, width * 0.22)

      // Add a new flower frequently enough to make the garden feel alive.
      if (now - lastFlower > 180) {
        flowers.push({
          // Position, size, movement, and petal values make each flower different.
          x: flowerMargin + Math.random() * Math.max(width - flowerMargin * 2, 1),
          ground: height * (0.38 + Math.random() * 0.58),
          height: 55 + Math.random() * 155,
          scale: 0.65 + Math.random() * 0.8,
          sway: 5 + Math.random() * 10,
          petals: 5 + Math.floor(Math.random() * 4),
          shape: ['classic', 'round', 'star'][Math.floor(Math.random() * 3)],
          centerColor: centerColors[Math.floor(Math.random() * centerColors.length)],
          centerSize: 4 + Math.random() * 3,
          tilt: (Math.random() - 0.5) * 0.3,
          petalTilt: (Math.random() - 0.5) * 0.25,
          color: flowerColors[flowers.length % flowerColors.length],
          seed: Math.random() * Math.PI * 2,
          createdAt: now,
        })
        lastFlower = now
      }

      // Start the flower sequence over after the garden becomes crowded.
      if (flowers.length > 34) flowers = []

      // Clear the previous frame, then draw vines behind the flowers.
      context.clearRect(0, 0, width, height)
      drawVine('left', { offset: 12, seed: 0.8, createdAt: 0, blooms: [0.42, 0.73] }, now, width, height)
      drawVine('right', { offset: 12, seed: 2.5, createdAt: 900, blooms: [0.5, 0.8] }, now, width, height)
      drawVine('left', { offset: 34, seed: 4.1, createdAt: 1700, blooms: [0.36, 0.68] }, now, width, height)
      drawVine('right', { offset: 34, seed: 5.7, createdAt: 2600, blooms: [0.45, 0.76] }, now, width, height)
      flowers.forEach((flower) => drawFlower(flower, now))

      // Ask the browser for the next frame to keep the drawing animated.
      animationFrame = requestAnimationFrame(animate)
    }

    // Start the animation and keep it responsive to window size changes.
    resize()
    window.addEventListener('resize', resize)
    animationFrame = requestAnimationFrame(animate)

    // Stop the loop and remove the resize listener when the component is removed.
    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <main className="garden">
      {/* The heading sits above the animated canvas. */}
      <p className="eyebrow">A little garden for you</p>
      <h1>Flowers, on repeat.</h1>
      <p className="intro">Hopefully these will work until I can pick you up some real ones :)</p>
      {/* All flowers and vines are painted inside this canvas. */}
      <canvas ref={canvasRef} className="flower-canvas" aria-label="An animated garden of flowers" />
    </main>
  )
}

export default App
