import { get } from "svelte/store"
import { ControlStyle, controlStyles } from "./useSetting"

export const trans = (id: number, d: 1 | -1) => {
  const tmp: ControlStyle[] = get(controlStyles)
  const nowIndex = tmp.findIndex(v => v.id === id)
  if (nowIndex === -1) {
    if (tmp.length === 0) {
      alert('コントロールが登録されていません')
      return
    }
    id = tmp[0].id
    return
  }
  // 右端の時
  if (nowIndex + 1 === tmp.length) {
    if (d === 1) {
      id = tmp[0].id
      return
    }
  }
  // 左端の時
  if (nowIndex === 0) {
    if (d === -1) {
      id = tmp[tmp.length - 1].id
      return
    }
  }
  id = tmp[nowIndex + d].id
}
