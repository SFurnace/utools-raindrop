window.exports = {
    "setting": {
        mode: "list",
        args: {
            enter: (action, callbackSetList) => {  // 进入插件应用时调用（可选）
                callbackSetList([
                    {
                        title: 'Set Access Key',
                        description: '',
                        icon: ''
                    },
                    {
                        title: 'Show Access Key',
                        description: '',
                        icon: ''
                    },
                    {
                        title: 'Clear Access Key',
                        description: '',
                        icon: ''
                    },
                ]);
            },

            search: (action, searchWord, callbackSetList) => { // 子输入框内容变化时被调用 可选 (未设置则无搜索)
                callbackSetList([
                    {
                        title: 'Set Access Key',
                        description: `set access key to ${searchWord}`,
                        data: searchWord,
                        icon: ''
                    },
                ]);
            },

            select: (action, itemData, callbackSetList) => { // 用户选择列表中某个条目时被调用
                window.utools.hideMainWindow();
                window.utools.showNotification(JSON.stringify(itemData));
                window.utools.outPlugin();
            },
            placeholder: "搜索"
        }
    },

    "search": {
        mode: "list",
        args: {
            enter: (action, callbackSetList) => {  // 进入插件应用时调用（可选）
                callbackSetList([
                    {
                        title: '这是标题',
                        description: '这是描述',
                        icon: '' // 图标(可选)
                    }
                ]);
            },

            search: (action, searchWord, callbackSetList) => { // 子输入框内容变化时被调用 可选 (未设置则无搜索)
                // 获取一些数据
                // 执行 callbackSetList 显示出来
                callbackSetList([
                    {
                        title: '这是标题',
                        description: '这是描述',
                        icon: '', // 图标
                        url: 'https://yuanliao.info'
                    }
                ]);
            },

            select: (action, itemData, callbackSetList) => { // 用户选择列表中某个条目时被调用
                window.utools.hideMainWindow();
                const url = itemData.url;
                require('electron').shell.openExternal(url);
                window.utools.outPlugin();
            },
            placeholder: "搜索"
        }
    }
};