export const componentsMap = {
    'el-button': {
        type: 'el-button',
        template: '<el-button type="primary">按钮</el-button>',
        options: [
            {
                label: '按钮文案',
                value: '按钮',
                type: 'input',
                prop: 'value',
            },
            {
                label: '按钮类型',
                value: 'primary'
            }
        ]
    },
    'el-input': {
        type: 'el-input',
        template: '<el-input>输入框</el-input>',
        options: [
            {
                label: '输入框文案',
                value: '输入框',
                type: 'input',
            },
            {
                label: '输入框类型',
                value: ''
            },
            {
                label: '输入框宽度',
                value: 'auto',
                type: 'input',
            }
        ]
    }
}