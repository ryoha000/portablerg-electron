import ZingTouch from '../../lib/ZingTouch/ZingTouch'

const useLayout = (ele: HTMLElement) => {
  const nowChange = { x: 0, y: 0 }
  // const now
  const region: Region = new ZingTouch.Region(document.body, true, true);
  region.bind(ele, 'pan', (e: PanEvent) => {
    console.log('move')
    if (e.detail.data.length === 0) {
      return
    }
    const data = e.detail.data[0]
    nowChange.x += data.change.x
    nowChange.y += data.change.y
    ele.style.transform = `translateX(${nowChange.x}px) translateY(${nowChange.y}px)`
  })
  region.bind(ele, 'distance', (e: DistanceEvent) => {
    console.log(e)
    // const data = e.detail.data[0]
    // nowChange.x += data.change.x
    // nowChange.y += data.change.y
    // ele.style.transform = `translateX(${nowChange.x}px) translateY(${nowChange.y}px)`
  })
};

const getXYFromTransform = (str: string) => {
  const arr = str.split(' ')
  const res = { x: 0, y: 0 }
  for (const v of arr) {
    const content = v.slice(10, -3)
    if (v.startsWith('translateX')) {
      res.x = Number(content)
    }
    if (v.startsWith('translateY')) {
      res.y = Number(content)
    }
  }
  return res
}
export default useLayout
