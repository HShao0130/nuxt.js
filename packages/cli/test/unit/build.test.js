import { consola, mockGetNuxt, mockGetBuilder, mockGetGenerator, NuxtCommand } from '../utils'

describe('build', () => {
  let build

  beforeAll(async () => {
    build = await import('../../src/commands/build').then(m => m.default)
    jest.spyOn(process, 'exit').mockImplementation(code => code)
  })

  afterAll(() => process.exit.mockRestore())
  afterEach(() => jest.resetAllMocks())

  test('has run function', () => {
    expect(typeof build.run).toBe('function')
  })

  test('builds on universal mode', async () => {
    mockGetNuxt({
      mode: 'universal',
      build: {
        analyze: true
      }
    })
    const builder = mockGetBuilder(Promise.resolve())

    await NuxtCommand.from(build).run()

    expect(builder).toHaveBeenCalled()
  })

  test('generates on spa mode', async () => {
    mockGetNuxt({
      mode: 'spa',
      build: {
        analyze: false
      }
    })
    const generate = mockGetGenerator(Promise.resolve())

    await NuxtCommand.from(build).run()

    expect(generate).toHaveBeenCalled()
    expect(process.exit).toHaveBeenCalled()
  })

  test('build with devtools', async () => {
    mockGetNuxt({
      mode: 'universal'
    })
    const builder = mockGetBuilder(Promise.resolve())

    const cmd = NuxtCommand.from(build)
    const args = ['build', '.', '--devtools']
    const argv = cmd.getArgv(args)
    argv._ = ['.']

    const options = await cmd.getNuxtConfig(argv)

    await cmd.run()

    expect(options.vue.config.devtools).toBe(true)
    expect(builder).toHaveBeenCalled()
  })

  test('catches error', async () => {
    mockGetNuxt({ mode: 'universal' })
    mockGetBuilder(Promise.reject(new Error('Builder Error')))

    await NuxtCommand.from(build).run()

    expect(consola.fatal).toHaveBeenCalledWith(new Error('Builder Error'))
  })
})
