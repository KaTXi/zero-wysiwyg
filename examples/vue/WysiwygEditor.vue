<!--
  Zero WYSIWYG — Vue 3 Wrapper Component

  Usage:
    <WysiwygEditor id="content" v-model="html" height="400px" locale="en" theme="dark" />

  Requirements:
    - Include zero-wysiwyg.css in your HTML or import it
    - Include zero-wysiwyg.js before your Vue bundle, or import it
-->
<template>
    <div :class="className">
        <textarea :id="id" :name="id" ref="textarea" style="width:100%">{{ modelValue }}</textarea>
    </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

export default {
    name: 'WysiwygEditor',
    props: {
        id: { type: String, default: 'editor' },
        modelValue: { type: String, default: '' },
        height: { type: String, default: '400px' },
        locale: { type: [String, Object], default: 'en' },
        theme: { type: String, default: null },
        wordCount: { type: Boolean, default: false },
        toolbarMode: { type: String, default: 'top' },
        slashCommands: { type: Boolean, default: false },
        className: { type: String, default: '' },
    },
    emits: ['update:modelValue', 'ready', 'focus', 'blur'],
    setup(props, { emit }) {
        const textarea = ref(null);
        let initialized = false;

        onMounted(() => {
            if (!window.ZeroWysiwyg) {
                console.error('ZeroWysiwyg not loaded.');
                return;
            }
            window.ZeroWysiwyg.init(props.id, {
                height: props.height,
                locale: props.locale,
                theme: props.theme,
                wordCount: props.wordCount,
                toolbarMode: props.toolbarMode,
                slashCommands: props.slashCommands,
                onChange: (html) => emit('update:modelValue', html),
                onReady: (inst) => emit('ready', inst),
                onFocus: () => emit('focus'),
                onBlur: () => emit('blur'),
            });
            initialized = true;
        });

        onBeforeUnmount(() => {
            if (initialized) window.ZeroWysiwyg.destroy(props.id);
        });

        // Sync external v-model changes into the editor
        watch(() => props.modelValue, (newVal) => {
            if (!initialized || !window.ZeroWysiwyg) return;
            const current = window.ZeroWysiwyg.getHTML(props.id);
            if (current !== newVal) {
                window.ZeroWysiwyg.setHTML(props.id, newVal);
            }
        });

        return { textarea };
    }
};
</script>