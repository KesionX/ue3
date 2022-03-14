export default function shouldSetAsProps(el: HTMLElement, key: string, _value: any) {
    if (key === 'form' && el.tagName === 'INPUT') return false;
    return key in el;
}
