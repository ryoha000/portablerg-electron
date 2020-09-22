import ZingTouch from '../../lib/ZingTouch/ZingTouch'
import { writable, get } from 'svelte/store';
// @ts-ignore
import { useMouse } from '../../lib/useMouse'

const useTouch = () => {
  const message = writable('')
  const { scroll } = useMouse()

  const init = (ele: HTMLElement) => {
    const region: Region = new ZingTouch.Region(document.body)
    // const region = new ZingTouch.Region(ele)
    region.bind(ele, 'swipe', (e) => {
      console.warn('swipe!')
      swipe(e)
    })
    region.bind(ele, 'tap', (e) => {
      message.set(`tap: ${JSON.stringify(e.detail)}`)
    })
    const pi = new ZingTouch.Distance();
    region.bind(ele, pi, (e) => {
      message.set(`pinch: ${JSON.stringify(e.detail)}`)
    })
    // const ex = new ZingTouch.Distance();
    // region.bind(ele, ex, (e) => {
    //   console.log(e)
    //   message.set(`expand: ${JSON.stringify(e.detail)}`)
    // })
    region.bind(ele, 'pan', (e) => {
      message.set(`pan: ${JSON.stringify(e.detail)}`)
    })
  }

  const swipe = (e: SwipeEvent) => {
    const data = e.detail.data[0]
    message.set(`${data.velocity}px/ms, ${Math.round(data.currentDirection * 180 / Math.PI)}°`)
    const r = data.velocity * data.duration
    const dPoint = {
      x: r * Math.cos(data.currentDirection / Math.PI),
      y: r * Math.sin(data.currentDirection / Math.PI)
    }
    scroll(dPoint)
  }


  return { init, message }
}

export default useTouch
