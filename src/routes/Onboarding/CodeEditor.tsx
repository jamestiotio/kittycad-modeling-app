import { OnboardingButtons, onboardingPaths, useDismiss, useNextClick } from '.'
import { useStore } from '../../useStore'
import { useBackdropHighlight } from 'hooks/useBackdropHighlight'

export default function CodeEditor() {
  const { buttonDownInStream } = useStore((s) => ({
    buttonDownInStream: s.buttonDownInStream,
  }))
  const dismiss = useDismiss()
  const next = useNextClick(onboardingPaths.PARAMETRIC_MODELING)

  return (
    <div className="fixed grid justify-end items-center inset-0 z-50 pointer-events-none">
      <div
        className="fixed inset-0 bg-black opacity-50 pointer-events-none"
        style={{ clipPath: useBackdropHighlight('code-pane') }}
      ></div>
      <div
        className={
          'z-10 max-w-xl border border-chalkboard-50 dark:border-chalkboard-80 shadow-lg h-3/4 flex flex-col justify-center bg-chalkboard-10 dark:bg-chalkboard-90 p-8 rounded' +
          (buttonDownInStream ? '' : ' pointer-events-auto')
        }
      >
        <section className="flex-1">
          <h2 className="text-2xl font-bold">
            Editing code with <code>kcl</code>
          </h2>
          <p className="my-4">
            The left pane is where you write your code. It's a code editor with
            syntax highlighting and autocompletion. We've decided to take the
            difficult route of writing our own language—called <code>kcl</code>
            —for describing geometry, because we don't want to inherit all the
            other functionality from existing languages. We have a lot of ideas
            about how <code>kcl</code> will evolve, and we want to hear your
            thoughts on it.
          </p>
          <p className="my-4">
            We've built a language server for <code>kcl</code> that provides
            documentation and autocompletion automatically generated from our
            compiler code. You can try it out by hovering over some of the
            function names in the pane now. If you like using VSCode, you can
            try out our{' '}
            <a
              href="https://marketplace.visualstudio.com/items?itemName=KittyCAD.kcl-language-server"
              rel="noreferrer noopener"
              target="_blank"
            >
              VSCode extension
            </a>
            .
          </p>
          <p className="my-4">
            You can resize the pane by dragging the handle on the right, and you
            can collapse it by clicking the title bar or pressing{' '}
            <kbd>Shift</kbd> + <kbd>C</kbd>.
          </p>
        </section>
        <OnboardingButtons
          dismiss={dismiss}
          next={next}
          nextText="Next: Parametric Modeling"
        />
      </div>
    </div>
  )
}
