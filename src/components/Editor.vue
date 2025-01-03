<template>
  <div class="editor-container">
    <div class="widget">
      <p>表单元素</p>
      <div>
        <el-button style="margin-bottom:12px" @dragstart="onDragStart('el-button')" draggable="true"
          class="draggable">按钮</el-button>
        <el-input @dragstart="onDragStart('el-input')" draggable="true" class="draggable"></el-input>
      </div>
    </div>
    <div class="preview" ref="previewContainer" @drop="onDrop" @dragover.prevent style="width: 500px"></div>
    <div class="editor">
      <el-input type="textarea" v-model="code" style="width: 500px;" :rows="12" @change="renderCode"></el-input type="textarea">

      <div class="option-list" v-if="curTemplate && curTemplate.options?.length > 0">
        <p>配置项</p>
        <div class="item" v-for="(item, index) in curTemplate.options" :key="index">
          <p style="text-align: left;">{{ item.label }}</p>
          <div v-if="item.type === 'input'">
            <el-input v-model="item.value" @change="(val) => temOptionChange(curTemplate, 'value', val)"></el-input>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { parse } from '@vue/compiler-sfc';
import * as Babel from '@babel/standalone';
import * as compileDom from '@vue/compiler-dom';
import * as compileCore from '@vue/compiler-core';
// import * as generate from '@babel/generator';
import * as compilerSfc from '@vue/compiler-sfc';
import ElementPlus from 'element-plus';
import { createApp, h, ref, watch, onMounted, nextTick } from 'vue';
import * as Vue from 'vue';
import 'element-plus/dist/index.css';
import { componentsMap } from '../config/component'

let currentApp = null; // 用于存储当前的应用实例

console.log(44, compilerSfc)
// 解析sfc template模块的
console.log(55, compileDom)
// 解析sfc template模块的
console.log(66, compileCore)

const code = ref('<script setup>console.log(567);console.log(ref);const aa = ref(); console.log(aa)<\/script><template><section id="lowcode">11</section></template><style>#lowcode { font-size: 24px; color: red; }</style>');
const previewContainer = ref(null);

const renderCode = async () => {
  try {
    const { descriptor } = compilerSfc.parse(code.value);
    const { ast } = compilerSfc.compileTemplate({ source: descriptor.template.content });
    console.log(11, descriptor, ast)
    // 将修改后的 AST 转换回代码
    const transformedCode = compileCore.generate(ast);
    console.log(22, transformedCode.code)

    if (descriptor.styles && descriptor.styles.length > 0) {
      descriptor.styles.forEach((styleBlock) => {
        const style = compilerSfc.compileStyle({
          source: styleBlock.content,
          id: 'code-css',
          scoped: styleBlock.scoped,
        });

        // 动态创建并应用样式
        if (style) {
          console.log(432, style, styleBlock)
          const styleEl = document.createElement('style');
          styleEl.textContent = style.code;
          document.head.appendChild(styleEl);
        }
      });
    }
    // 动态创建一个 Vue 组件
    const Component = {
      name: 'DynamicComponent',
      setup() {
        const context = {};
        if (descriptor.scriptSetup) {
          try {
            // 使用 new Function 来执行 scriptSetup 内容
            new Function('context', 'ref', descriptor.scriptSetup.content).call(context, context, ref);
          } catch (error) {
            console.error('Error in scriptSetup:', error);
          }
        }
        return context;
      },
      template: descriptor.template ? descriptor.template.content : '<div>No template found</div>',
    };

    // 清空之前的预览内容
    if (previewContainer.value) {
      previewContainer.value.innerHTML = '';
    } else {
      console.error('previewContainer is not defined');
    }

    // 如果有之前的 app 实例，先卸载它
    if (currentApp) {
      currentApp.unmount();
    }
    // 创建一个新的 Vue 应用实例来渲染组件
    const app = createApp({
      render() {
        return h(Component);
      },
    });
    console.log('Vue App Instance:', app);

    // 注册 Element Plus
    app.use(ElementPlus);

    // 挂载到预览容器
    nextTick(() => {
      if (previewContainer.value) {
        try {
          app.mount(previewContainer.value);
          currentApp = app; // 更新当前的应用实例
        } catch (error) {
          console.error('Error mounting app:', error);
        }
      } else {
        console.error('previewContainer is not available after nextTick');
      }
    }).catch(error => {
      console.error('Error during nextTick:', error);
    });
  } catch (error) {
    console.error('Error compiling Vue SFC:', error);
  }
};

// watch(code, renderCode);

onMounted(() => {
  renderCode();
});
const currentCom = ref(null)
const curTemplate = ref(null)

function onDragStart(el) {
  currentCom.value = el
}
function onDrop(event) {
  const temCom = JSON.parse(JSON.stringify(componentsMap[currentCom.value]))
  curTemplate.value = temCom
  let insertString = temCom.template;
  const codeId = new Date().getTime()
  insertString = insertId(insertString, codeId)
  curTemplate.value.id = codeId
  console.log(insertString)
  const sectionRegex = /(<section id="lowcode">)([\s\S]*?)(<\/section>)/i;

  // 使用正则表达式替换
  const modifiedHtml = code.value.replace(sectionRegex, (match, p1, p2, p3) => {
    return `${p1}${p2}${insertString}${p3}`;
  });
  code.value = modifiedHtml;
  renderCode();
}
function insertId(str, id) {
  // 要插入的字符串
  const insertStr = ` code-id="${id}"`;
  // 正则表达式匹配第一个 >
  const regex = />(.*)/;
  // 使用正则表达式替换
  const modifiedStr = str.replace(regex, insertStr + ' >$1');
  return modifiedStr;
}
function temOptionChange(tem, type, val) {
  console.log(333, val)
  if (type === 'value') {
    // 使用 RegExp 构造函数创建正则表达式
    const regex = new RegExp(`code-id="${tem.id}" >(.*?)</el-button>`, 'g');
    // 替换匹配到的内容中的动态部分
    const modifiedHtml = code.value.replace(regex, `code-id="${tem.id}" >${val}</el-button>`);
    code.value = modifiedHtml;
  }
  console.log(tem)
}

</script>

<style scoped>
.editor-container {
  display: flex;
  width: 100%;
  height: 100vh;
}

.widget {
  flex: 0 0 100px;
  padding: 16px;
  border: 1px solid #ccc;
}

.editor,
.preview {
  flex: 1;
  padding: 16px;
  border: 1px solid #ccc;
}

.editor textarea {
  width: 100%;
  height: 100%;
  resize: none;
}

.draggable {
  /* user-select: none; */
  cursor: move;
}

.draggable:active {
  cursor: grabbing;
  /* 设置拖拽时的光标 */
}

.option-list {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-left: 12px;
}
</style>