import { onMounted, onUnmounted } from "vue";

export function useScript(props: { src: string; defer: boolean; id: string }) {
  let el: HTMLScriptElement;

  onMounted(() => {
    el = document.createElement("script");
    el.src = props.src;
    el.defer = props.defer;

    if (props.id) {
      el.id = props.id;
    }
    document.body.appendChild(el);
  });

  onUnmounted(() => {
    document.body.removeChild(el);
  });
}
