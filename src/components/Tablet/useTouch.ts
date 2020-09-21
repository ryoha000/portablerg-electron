import ZingTouch from '../../lib/ZingTouch/ZingTouch'
import { writable, get } from 'svelte/store';

const useTouch = () => {
  const message = writable('')

  const init = (ele: HTMLElement) => {
    const region = new ZingTouch.Region(document.body)
    // const region = new ZingTouch.Region(ele)
    region.bind(ele, 'swipe', (e: ActionEvent) => {
      console.warn('swipe!')
      message.set(`swipe: ${JSON.stringify(e.detail)}`)
    })
    region.bind(ele, 'tap', (e: ActionEvent) => {
      message.set(`tap: ${JSON.stringify(e.detail)}`)
    })
    const pi = new ZingTouch.Distance();
    region.bind(ele, pi, (e: ActionEvent) => {
      message.set(`pinch: ${JSON.stringify(e.detail)}`)
    })
    // const ex = new ZingTouch.Distance();
    // region.bind(ele, ex, (e: ActionEvent) => {
    //   console.log(e)
    //   message.set(`expand: ${JSON.stringify(e.detail)}`)
    // })
    region.bind(ele, 'pan', (e: ActionEvent) => {
      message.set(`pan: ${JSON.stringify(e.detail)}`)
    })
  }

  // const 


  return { init, message }
}

export default useTouch
