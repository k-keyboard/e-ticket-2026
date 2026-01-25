<script setup>
const props = defineProps({
    modelValue: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const editor = useEditor({
    content: props.modelValue,
    extensions: [TiptapStarterKit],
    onUpdate: ({ editor }) => {
        emit('update:modelValue', editor.getHTML())
    },
})

// ฟังก์ชันล้างรูปแบบทั้งหมด
const clearAllFormatting = () => {
    if (editor.value) {
        editor.value.chain().focus().unsetAllMarks().run()
        editor.value.chain().focus().clearNodes().run()
    }
}

watch(
    () => props.modelValue,
    (value) => {
        if (editor.value && editor.value.getHTML() !== value) {
            editor.value.commands.setContent(value, false)
        }
    }
)

onBeforeUnmount(() => {
    editor.value?.destroy()
})
</script>

<template>
    <div class="tiptap-container">
        <ClientOnly>
            <div v-if="editor" class="toolbar-wrapper">
                <a-flex wrap="wrap" gap="small" align="center">
                    <a-space size="small">
                        <a-button-group>
                            <a-button
                                size="small"
                                :type="editor.isActive('bold') ? 'primary' : 'default'"
                                @click="editor.chain().focus().toggleBold().run()"
                                >ตัวหนา</a-button
                            >
                            <a-button
                                size="small"
                                :type="editor.isActive('italic') ? 'primary' : 'default'"
                                @click="editor.chain().focus().toggleItalic().run()"
                                >ตัวเอียง</a-button
                            >
                            <a-button
                                size="small"
                                :type="editor.isActive('strike') ? 'primary' : 'default'"
                                @click="editor.chain().focus().toggleStrike().run()"
                                >ขีดฆ่า</a-button
                            >
                            <a-button
                                size="small"
                                :type="editor.isActive('code') ? 'primary' : 'default'"
                                @click="editor.chain().focus().toggleCode().run()"
                                >โค้ดสั้น</a-button
                            >
                        </a-button-group>
                    </a-space>

                    <a-divider type="vertical" />

                    <a-space size="small">
                        <a-button
                            size="small"
                            :type="editor.isActive('paragraph') ? 'primary' : 'default'"
                            @click="editor.chain().focus().setParagraph().run()"
                            >ข้อความปกติ</a-button
                        >
                        <a-button-group>
                            <a-button
                                v-for="i in [1, 2, 3, 4, 5]"
                                :key="i"
                                size="small"
                                :type="editor.isActive('heading', { level: i }) ? 'primary' : 'default'"
                                @click="editor.chain().focus().toggleHeading({ level: i }).run()"
                            >
                                H{{ i }}
                            </a-button>
                        </a-button-group>
                    </a-space>

                    <a-divider type="vertical" />

                    <a-space size="small">
                        <a-button-group>
                            <a-button
                                size="small"
                                :type="editor.isActive('bulletList') ? 'primary' : 'default'"
                                @click="editor.chain().focus().toggleBulletList().run()"
                                >จุดไข่ปลา</a-button
                            >
                            <a-button
                                size="small"
                                :type="editor.isActive('orderedList') ? 'primary' : 'default'"
                                @click="editor.chain().focus().toggleOrderedList().run()"
                                >ลำดับเลข</a-button
                            >
                            <a-button
                                size="small"
                                :type="editor.isActive('blockquote') ? 'primary' : 'default'"
                                @click="editor.chain().focus().toggleBlockquote().run()"
                                >คำคม/อ้างอิง</a-button
                            >
                            <a-button
                                size="small"
                                :type="editor.isActive('codeBlock') ? 'primary' : 'default'"
                                @click="editor.chain().focus().toggleCodeBlock().run()"
                                >กล่องโค้ด</a-button
                            >
                        </a-button-group>
                    </a-space>

                    <a-divider type="vertical" />

                    <a-space size="small">
                        <a-button size="small" @click="editor.chain().focus().setHorizontalRule().run()"
                            >เส้นคั่นบรรทัด</a-button
                        >
                        <a-button size="small" @click="editor.chain().focus().setHardBreak().run()"
                            >ตัดขึ้นบรรทัดใหม่</a-button
                        >
                    </a-space>

                    <a-divider type="vertical" />

                    <a-space size="small">
                        <a-button-group>
                            <a-button
                                size="small"
                                @click="editor.chain().focus().undo().run()"
                                :disabled="!editor.can().chain().focus().undo().run()"
                                >ย้อนกลับ</a-button
                            >
                            <a-button
                                size="small"
                                @click="editor.chain().focus().redo().run()"
                                :disabled="!editor.can().chain().focus().redo().run()"
                                >ทำต่อ</a-button
                            >
                        </a-button-group>
                        <a-button size="small" danger @click="clearAllFormatting">ล้างรูปแบบทั้งหมด</a-button>
                    </a-space>
                </a-flex>
            </div>

            <div class="editor-content-area">
                <TiptapEditorContent :editor="editor" />
            </div>

            <template #fallback>
                <a-flex justify="center" align="center" style="min-height: 450px">
                    <a-spin tip="กำลังเตรียมเครื่องมือเขียน..." />
                </a-flex>
            </template>
        </ClientOnly> 
    </div>
</template>

<style lang="scss" scoped>
.tiptap-container {
    border: 1px solid #d9d9d9;
    border-radius: 8px;
    background-color: #fff;
    overflow: hidden;
    transition: border-color 0.3s ease;

    &:hover {
        border-color: #40a9ff;
    }

    &:focus-within {
        border-color: #1890ff;
        box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
    }

    .toolbar-wrapper {
        padding: 10px 15px;
        background-color: #fafafa;
        border-bottom: 1px solid #d9d9d9;
    }

    .editor-content-area {
        padding: 24px;
        min-height: 400px;
        background-color: #ffffff;

        :deep(.tiptap) {
            outline: none;
            min-height: 380px;
            font-size: 16px;
            line-height: 1.7;

            p {
                margin-bottom: 1.2em;
            }
            h1,
            h2,
            h3,
            h4,
            h5 {
                font-weight: 700;
                margin-top: 1.5em;
                margin-bottom: 0.5em;
            }
            h1 {
                font-size: 2.2em;
            }
            h2 {
                font-size: 1.8em;
            }
            h3 {
                font-size: 1.5em;
            }

            ul,
            ol {
                padding-left: 2em;
                margin-bottom: 1.2em;
            }

            blockquote {
                border-left: 5px solid #1890ff;
                padding: 10px 20px;
                background-color: #f0f7ff;
                color: #555;
                font-style: italic;
                margin: 1.5em 0;
            }

            pre {
                background: #2d2d2d;
                color: #ccc;
                font-family: 'Courier New', Courier, monospace;
                padding: 1rem;
                border-radius: 6px;
                margin: 1em 0;
                code {
                    color: inherit;
                    padding: 0;
                    background: none;
                }
            }

            code {
                background-color: #fff1f0;
                color: #cf1322;
                padding: 0.2em 0.4em;
                border-radius: 4px;
                font-size: 0.9em;
            }

            hr {
                border: 0;
                border-top: 2px solid #f0f0f0;
                margin: 2em 0;
            }
        }
    }
}
</style>
