import { test, expect } from '@playwright/test'
import { secrets } from './secrets'
import { EngineCommand } from '../../src/lang/std/engineConnection'
import { v4 as uuidv4 } from 'uuid'
import { getUtils } from './test-utils'
import { Models } from '@kittycad/lib'
import fsp from 'fs/promises'
import { spawn } from 'child_process'
import { APP_NAME } from 'lib/constants'

test.beforeEach(async ({ context, page }) => {
  await context.addInitScript(async (token) => {
    localStorage.setItem('TOKEN_PERSIST_KEY', token)
    localStorage.setItem('persistCode', ``)
    localStorage.setItem(
      'SETTINGS_PERSIST_KEY',
      JSON.stringify({
        baseUnit: 'in',
        cameraControls: 'KittyCAD',
        defaultDirectory: '',
        defaultProjectName: 'project-$nnn',
        onboardingStatus: 'dismissed',
        showDebugPanel: true,
        textWrapping: 'On',
        theme: 'system',
        unitSystem: 'imperial',
      })
    )
  }, secrets.token)
  // reducedMotion kills animations, which speeds up tests and reduces flakiness
  await page.emulateMedia({ reducedMotion: 'reduce' })
})

test.setTimeout(60000)

test('change camera, show planes', async ({ page, context }) => {
  const u = getUtils(page)
  await page.setViewportSize({ width: 1200, height: 500 })
  await page.goto('/')
  await u.waitForAuthSkipAppStart()
  await u.openAndClearDebugPanel()

  const camCmd: EngineCommand = {
    type: 'modeling_cmd_req',
    cmd_id: uuidv4(),
    cmd: {
      type: 'default_camera_look_at',
      center: { x: 0, y: 0, z: 0 },
      up: { x: 0, y: 0, z: 1 },
      vantage: { x: 0, y: 85, z: 85 },
    },
  }

  await u.sendCustomCmd(camCmd)
  await u.waitForCmdReceive('default_camera_look_at')

  // rotate
  await u.closeDebugPanel()
  await page.mouse.move(700, 200)
  await page.mouse.down({ button: 'right' })
  await page.mouse.move(600, 300)
  await page.mouse.up({ button: 'right' })

  await u.openDebugPanel()
  await u.waitForCmdReceive('camera_drag_end')
  await page.waitForTimeout(500)
  await u.clearCommandLogs()

  await page.getByRole('button', { name: 'Start Sketch' }).click()

  await u.waitForDefaultPlanesVisibilityChange()
  await u.closeDebugPanel()

  await expect(page).toHaveScreenshot({
    maxDiffPixels: 100,
  })

  await u.openAndClearDebugPanel()
  await page.getByRole('button', { name: 'Exit Sketch' }).click()
  await u.waitForDefaultPlanesVisibilityChange()

  await u.sendCustomCmd(camCmd)
  await u.waitForCmdReceive('default_camera_look_at')

  await u.clearCommandLogs()
  await u.closeDebugPanel()
  // pan
  await page.keyboard.down('Shift')
  await page.mouse.move(600, 200)
  await page.mouse.down({ button: 'right' })
  await page.mouse.move(700, 200)
  await page.mouse.up({ button: 'right' })
  await page.keyboard.up('Shift')

  await u.openDebugPanel()
  await u.waitForCmdReceive('camera_drag_end')
  await page.waitForTimeout(300)
  await u.clearCommandLogs()

  await page.getByRole('button', { name: 'Start Sketch' }).click()
  await u.waitForDefaultPlanesVisibilityChange()
  await u.closeDebugPanel()

  await expect(page).toHaveScreenshot({
    maxDiffPixels: 100,
  })

  await u.openAndClearDebugPanel()
  await page.getByRole('button', { name: 'Exit Sketch' }).click()
  await u.waitForDefaultPlanesVisibilityChange()

  await u.sendCustomCmd(camCmd)
  await u.waitForCmdReceive('default_camera_look_at')

  await u.clearCommandLogs()
  await u.closeDebugPanel()

  // zoom
  await page.keyboard.down('Control')
  await page.mouse.move(700, 400)
  await page.mouse.down({ button: 'right' })
  await page.mouse.move(700, 350)
  await page.mouse.up({ button: 'right' })
  await page.keyboard.up('Control')

  await u.openDebugPanel()
  await u.waitForCmdReceive('camera_drag_end')
  await page.waitForTimeout(300)
  await u.clearCommandLogs()

  await page.getByRole('button', { name: 'Start Sketch' }).click()
  await u.waitForDefaultPlanesVisibilityChange()
  await u.closeDebugPanel()

  await expect(page).toHaveScreenshot({
    maxDiffPixels: 100,
  })
})

test('exports of each format should work', async ({ page, context }) => {
  // FYI this test doesn't work with only engine running locally
  // And you will need to have the KittyCAD CLI installed
  const u = getUtils(page)
  await context.addInitScript(async () => {
    ;(window as any).playwrightSkipFilePicker = true
    localStorage.setItem(
      'persistCode',
      `const topAng = 25
const bottomAng = 35
const baseLen = 3.5
const baseHeight = 1
const totalHeightHalf = 2
const armThick = 0.5
const totalLen = 9.5
const part001 = startSketchOn('-XZ')
  |> startProfileAt([0, 0], %)
  |> yLine(baseHeight, %)
  |> xLine(baseLen, %)
  |> angledLineToY({
        angle: topAng,
        to: totalHeightHalf,
        tag: 'seg04'
      }, %)
  |> xLineTo({ to: totalLen, tag: 'seg03' }, %)
  |> yLine({ length: -armThick, tag: 'seg01' }, %)
  |> angledLineThatIntersects({
        angle: _180,
        offset: -armThick,
        intersectTag: 'seg04'
      }, %)
  |> angledLineToY([segAng('seg04', %) + 180, _0], %)
  |> angledLineToY({
        angle: -bottomAng,
        to: -totalHeightHalf - armThick,
        tag: 'seg02'
      }, %)
  |> xLineTo(segEndX('seg03', %) + 0, %)
  |> yLine(-segLen('seg01', %), %)
  |> angledLineThatIntersects({
        angle: _180,
        offset: -armThick,
        intersectTag: 'seg02'
      }, %)
  |> angledLineToY([segAng('seg02', %) + 180, -baseHeight], %)
  |> xLineTo(_0, %)
  |> close(%) 
  |> extrude(4, %)`
    )
  })
  await page.setViewportSize({ width: 1200, height: 500 })
  await page.goto('/')
  await u.waitForAuthSkipAppStart()
  await u.openDebugPanel()
  await u.waitForDefaultPlanesVisibilityChange()
  await u.expectCmdLog('[data-message-type="execution-done"]')
  await u.waitForCmdReceive('extrude')
  await page.waitForTimeout(1000)
  await u.clearAndCloseDebugPanel()

  await page.getByRole('button', { name: APP_NAME }).click()

  interface Paths {
    modelPath: string
    imagePath: string
    outputType: string
  }
  const doExport = async (
    output: Models['OutputFormat_type']
  ): Promise<Paths> => {
    await page.getByRole('button', { name: 'Export Model' }).click()

    const exportSelect = page.getByTestId('export-type')
    await exportSelect.selectOption({ label: output.type })

    if ('storage' in output) {
      const storageSelect = page.getByTestId('export-storage')
      await storageSelect.selectOption({ label: output.storage })
    }

    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Export', exact: true }).click()
    const download = await downloadPromise
    const downloadLocationer = (extra = '', isImage = false) =>
      `./e2e/playwright/export-snapshots/${output.type}-${
        'storage' in output ? output.storage : ''
      }${extra}.${isImage ? 'png' : output.type}`
    const downloadLocation = downloadLocationer()
    const downloadLocation2 = downloadLocationer('-2')

    if (output.type === 'gltf' && output.storage === 'standard') {
      // wait for second download
      const download2 = await page.waitForEvent('download')
      await download.saveAs(downloadLocation)
      await download2.saveAs(downloadLocation2)

      // rewrite uri to reference our file name
      const fileContents = await fsp.readFile(downloadLocation, 'utf-8')
      const isJson = fileContents.includes('buffers')
      let contents = fileContents
      let reWriteLocation = downloadLocation
      let uri = downloadLocation2.split('/').pop()
      if (!isJson) {
        contents = await fsp.readFile(downloadLocation2, 'utf-8')
        reWriteLocation = downloadLocation2
        uri = downloadLocation.split('/').pop()
      }
      contents = contents.replace(/"uri": ".*"/g, `"uri": "${uri}"`)
      await fsp.writeFile(reWriteLocation, contents)
    } else {
      await download.saveAs(downloadLocation)
    }

    if (output.type === 'step') {
      // stable timestamps for step files
      const fileContents = await fsp.readFile(downloadLocation, 'utf-8')
      const newFileContents = fileContents.replace(
        /[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]+[0-9]+[0-9]\+[0-9]{2}:[0-9]{2}/g,
        '1970-01-01T00:00:00.0+00:00'
      )
      await fsp.writeFile(downloadLocation, newFileContents)
    }
    return {
      modelPath: downloadLocation,
      imagePath: downloadLocationer('', true),
      outputType: output.type,
    }
  }
  const axisDirectionPair: Models['AxisDirectionPair_type'] = {
    axis: 'z',
    direction: 'positive',
  }
  const sysType: Models['System_type'] = {
    forward: axisDirectionPair,
    up: axisDirectionPair,
  }

  const exportLocations: Paths[] = []

  // NOTE it was easiest to leverage existing types and have doExport take Models['OutputFormat_type'] as in input
  // just note that only `type` and `storage` are used for selecting the drop downs is the app
  // the rest are only there to make typescript happy
  exportLocations.push(
    await doExport({
      type: 'step',
      coords: sysType,
    })
  )
  exportLocations.push(
    await doExport({
      type: 'ply',
      coords: sysType,
      selection: { type: 'default_scene' },
      storage: 'ascii',
      units: 'in',
    })
  )
  exportLocations.push(
    await doExport({
      type: 'ply',
      storage: 'binary_little_endian',
      coords: sysType,
      selection: { type: 'default_scene' },
      units: 'in',
    })
  )
  exportLocations.push(
    await doExport({
      type: 'ply',
      storage: 'binary_big_endian',
      coords: sysType,
      selection: { type: 'default_scene' },
      units: 'in',
    })
  )
  exportLocations.push(
    await doExport({
      type: 'stl',
      storage: 'ascii',
      coords: sysType,
      units: 'in',
      selection: { type: 'default_scene' },
    })
  )
  exportLocations.push(
    await doExport({
      type: 'stl',
      storage: 'binary',
      coords: sysType,
      units: 'in',
      selection: { type: 'default_scene' },
    })
  )
  exportLocations.push(
    await doExport({
      // obj seems to be a little flaky, times out tests sometimes
      type: 'obj',
      coords: sysType,
      units: 'in',
    })
  )
  exportLocations.push(
    await doExport({
      type: 'gltf',
      storage: 'embedded',
      presentation: 'pretty',
    })
  )
  exportLocations.push(
    await doExport({
      type: 'gltf',
      storage: 'binary',
      presentation: 'pretty',
    })
  )

  // TODO: gltfs don't seem to work with snap shots. push onto exportLocations once it's figured out
  await doExport({
    type: 'gltf',
    storage: 'standard',
    presentation: 'pretty',
  })

  // close page to disconnect websocket since we can only have one open atm
  await page.close()

  // snapshot exports, good compromise to capture that exports are healthy without getting bogged down in "did the formatting change" changes
  // context: https://github.com/KittyCAD/modeling-app/issues/1222
  for (const { modelPath, imagePath, outputType } of exportLocations) {
    const cliCommand = `export KITTYCAD_TOKEN=${secrets.snapshottoken} && kittycad file snapshot --output-format=png --src-format=${outputType} ${modelPath} ${imagePath}`
    const child = spawn(cliCommand, { shell: true })
    await new Promise((resolve, reject) => {
      child.on('error', (code: any, msg: any) => {
        console.log('error', code, msg)
        reject()
      })
      child.on('exit', (code, msg) => {
        console.log('exit', code, msg)
        if (code !== 0) {
          reject(`exit code ${code} for model ${modelPath}`)
        } else {
          resolve(true)
        }
      })
      child.stderr.on('data', (data) => console.log(`stderr: ${data}`))
      child.stdout.on('data', (data) => console.log(`stdout: ${data}`))
    })
  }
})
