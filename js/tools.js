// 工具管理器
const toolManager = {

    // 打开提示词模板1
    openPromptTemplate1() {
        const modal = document.getElementById('prompt-template1-modal');
        modal.classList.add('active');
        this.setupSlotInputs(1);
    },

    // 关闭提示词模板1
    closePromptTemplate1() {
        const modal = document.getElementById('prompt-template1-modal');
        modal.classList.remove('active');
        this.resetPromptTemplate(1);
    },

    // 打开提示词模板2
    openPromptTemplate2() {
        const modal = document.getElementById('prompt-template2-modal');
        modal.classList.add('active');
        this.setupSlotInputs(2);
    },

    // 关闭提示词模板2
    closePromptTemplate2() {
        const modal = document.getElementById('prompt-template2-modal');
        modal.classList.remove('active');
        this.resetPromptTemplate(2);
    },

    // 打开提示词模板3
    openPromptTemplate3() {
        const modal = document.getElementById('prompt-template3-modal');
        modal.classList.add('active');
        this.setupSlotInputs(3);
    },

    // 关闭提示词模板3
    closePromptTemplate3() {
        const modal = document.getElementById('prompt-template3-modal');
        modal.classList.remove('active');
        this.resetPromptTemplate(3);
    },

    // 打开提示词模板4
    openPromptTemplate4() {
        const modal = document.getElementById('prompt-template4-modal');
        modal.classList.add('active');
        this.setupSlotInputs(4);
    },

    // 关闭提示词模板4
    closePromptTemplate4() {
        const modal = document.getElementById('prompt-template4-modal');
        modal.classList.remove('active');
        this.resetPromptTemplate(4);
    },

    // 打开提示词模板5
    openPromptTemplate5() {
        const modal = document.getElementById('prompt-template5-modal');
        modal.classList.add('active');
        this.setupSlotInputs(5);
    },

    // 关闭提示词模板5
    closePromptTemplate5() {
        const modal = document.getElementById('prompt-template5-modal');
        modal.classList.remove('active');
        this.resetPromptTemplate(5);
    },

    // 打开提示词模板6
    openPromptTemplate6() {
        const modal = document.getElementById('prompt-template6-modal');
        modal.classList.add('active');
        this.setupSlotInputs(6);
    },

    // 关闭提示词模板6
    closePromptTemplate6() {
        const modal = document.getElementById('prompt-template6-modal');
        modal.classList.remove('active');
        this.resetPromptTemplate(6);
    },

    // 打开提示词模板7
    openPromptTemplate7() {
        const modal = document.getElementById('prompt-template7-modal');
        modal.classList.add('active');
        this.setupSlotInputs(7);
    },

    // 关闭提示词模板7
    closePromptTemplate7() {
        const modal = document.getElementById('prompt-template7-modal');
        modal.classList.remove('active');
        this.resetPromptTemplate(7);
    },

    // 打开提示词模板8
    openPromptTemplate8() {
        const modal = document.getElementById('prompt-template8-modal');
        modal.classList.add('active');
        this.setupSlotInputs(8);
    },

    // 关闭提示词模板8
    closePromptTemplate8() {
        const modal = document.getElementById('prompt-template8-modal');
        modal.classList.remove('active');
        this.resetPromptTemplate(8);
    },

    // 设置输入框事件监听
    setupSlotInputs(templateNum) {
        const modal = document.getElementById(`prompt-template${templateNum}-modal`);
        const inputs = modal.querySelectorAll('.slot-input');
        inputs.forEach(input => {
            const newInput = input.cloneNode(true);
            input.parentNode.replaceChild(newInput, input);
            
            newInput.addEventListener('input', (e) => {
                const target = e.target.dataset.target;
                const value = e.target.value;
                this.updateSlot(target, value);
            });
        });
        
        const slots = modal.querySelectorAll('.prompt-slot');
        slots.forEach(slot => {
            const newSlot = slot.cloneNode(true);
            slot.parentNode.replaceChild(newSlot, slot);
            
            newSlot.addEventListener('input', (e) => {
                const slotName = e.target.dataset.slot;
                const value = e.target.textContent;
                const input = modal.querySelector(`.slot-input[data-target="${slotName}"]`);
                if (input) {
                    input.value = value;
                }
            });
        });
    },

    // 更新挖空内容
    updateSlot(slotName, value) {
        const slot = document.querySelector(`.prompt-slot[data-slot="${slotName}"]`);
        if (slot) {
            slot.textContent = value || '';
        }
    },

    // 获取单个挖空值
    getSlotValue(slotName) {
        const slot = document.querySelector(`.prompt-slot[data-slot="${slotName}"]`);
        return slot ? slot.textContent.trim() : '';
    },

    // 重置提示词模板
    resetPromptTemplate(templateNum) {
        const modal = document.getElementById(`prompt-template${templateNum}-modal`);
        const inputs = modal.querySelectorAll('.slot-input');
        inputs.forEach(input => {
            const defaultValue = input.getAttribute('value') || '';
            input.value = defaultValue;
        });
        
        const defaults = {
            1: {
                'year': '2026', 'month': 'x', 'day': 'x', 'event_type': '比赛', 'location': 'xx',
                'schedule_type': 'xxx赛程', 'info_type': '成绩/比赛细节', 'count': 'x', 'keyword': 'xx',
                'url': 'https://www.formula1.com/en/results/2026/races/1279/australia/practice/1'
            },
            2: {
                'year2': 'xxxx', 'month2': 'xx', 'day2': 'xx', 'event2': '赛事', 'schedule2': '赛程',
                'count2': '30', 'aspects2': 'xxxx', 'keyword2': 'xxx'
            },
            3: {
                'year3': 'xxxx', 'month3': 'xx', 'day3': 'xx', 'event3': '赛事', 'schedule3': '赛程',
                'wordcount3': '字数', 'title3': 'xxx', 'direction3': '内容方向', 'style3': '文案模版'
            },
            4: {
                'routes4': '线路list'
            },
            5: {
                'count5': '30', 'theme5': '卡丁车', 'aspects5': '山路驾驶安全规则、雨天/雾天山路行车注意事项、跑山前的车辆必备检查项',
                'type5': '汽车', 'exclude5': '卡丁车'
            },
            6: {
                'count6': '60', 'price6': '15-20万、20-30万、10万以下', 'energy6': '纯电、混动、增程、纯油',
                'body6': '轿车、SUV、跑车', 'compare6': '2', 'minlen6': '15', 'maxlen6': '30'
            },
            7: {
                'minwords7': '100', 'maxwords7': '150',
                'hotwords7': '闭眼入、真香、劝退、种草、拉满、卷王、YYDS、破防、拿捏、上头、下头、离谱、无语、救命、谁懂啊、家人们、有一说一、懂的都懂、不吹不黑、无广、纯分享、亲测',
                'example7': '说实话，这俩车放一块我纠结了好久。A车外观是真香，开出去回头率拉满，但内饰塑料感有点强，劝退了。B车没那么张扬，但坐进去质感拿捏住了，家用的话我闭眼入B。',
                'titles7': '标题...'
            },
            8: {
                'count8': '10', 'price8': '15-20万、20-30万、10万以下', 'energy8': '纯电、混动、增程、纯油',
                'body8': '轿车、SUV、跑车', 'minlen8': '15', 'maxlen8': '30'
            }
        };
        
        const defaultSlots = defaults[templateNum] || {};
        Object.keys(defaultSlots).forEach(slotName => {
            const slot = modal.querySelector(`.prompt-slot[data-slot="${slotName}"]`);
            if (slot) {
                slot.textContent = defaultSlots[slotName];
            }
        });
        
        const resultDiv = modal.querySelector('.prompt-result');
        if (resultDiv) {
            resultDiv.style.display = 'none';
        }
    },

    // 复制提示词模板1
    copyPromptTemplate1() {
        const year = this.getSlotValue('year');
        const month = this.getSlotValue('month');
        const day = this.getSlotValue('day');
        const eventType = this.getSlotValue('event_type');
        const location = this.getSlotValue('location');
        const scheduleType = this.getSlotValue('schedule_type');
        const infoType = this.getSlotValue('info_type');
        const count = this.getSlotValue('count');
        const keyword = this.getSlotValue('keyword');
        const url = this.getSlotValue('url');
        
        const text = `帮我在这个网站搜索下${year}年${month}月${day}日 ${eventType} ${location}站 ${scheduleType}的${infoType}, 根据结果给出${count}个非常吸睛的短视频标题, 要求30字以内, 必须包含字段${keyword}, 一定要多来源搜索并核实.\n参考网站: ${url}`;
        
        this.copyToClipboard(text, 1);
    },

    // 复制提示词模板2
    copyPromptTemplate2() {
        const year = this.getSlotValue('year2');
        const month = this.getSlotValue('month2');
        const day = this.getSlotValue('day2');
        const event = this.getSlotValue('event2');
        const schedule = this.getSlotValue('schedule2');
        const count = this.getSlotValue('count2');
        const aspects = this.getSlotValue('aspects2');
        const keyword = this.getSlotValue('keyword2');
        
        const text = `帮我搜索下即将在${year}年${month}月${day}日开赛的${event} ${schedule}站, 一定要二次核对赛事的准确信息, 并构思${count}个非常吸睛的短视频标题, 可以从${aspects}等方面撰写. 每个标题字数小于30字, 且必须包含文字${keyword}.`;
        
        this.copyToClipboard(text, 2);
    },

    // 复制提示词模板3
    copyPromptTemplate3() {
        const year = this.getSlotValue('year3');
        const month = this.getSlotValue('month3');
        const day = this.getSlotValue('day3');
        const event = this.getSlotValue('event3');
        const schedule = this.getSlotValue('schedule3');
        const wordcount = this.getSlotValue('wordcount3');
        const title = this.getSlotValue('title3');
        const direction = this.getSlotValue('direction3');
        const style = this.getSlotValue('style3');
        
        const text = `搜索下${year}年${month}月${day}日开赛的${event} ${schedule}站, 帮我写一篇不少于 ${wordcount} 字的短视频文案口播稿，要纯自然文字，不要序号或特殊符号。视频标题为${title}，写下${direction}。文字要自然像人们正常说话介绍主题，用词不浮夸，有数据干货，一定要核实信息！只需要写口播文案, 不需要额外的配音和画面提示,  不要「当儿童组小车手在T18弯道超车时，他们或许正踩下中国赛车未来的第一脚油门」等空话，语言风格可以参考以下内容：${style}`;
        
        this.copyToClipboard(text, 3);
    },

    // 复制提示词模板4
    copyPromptTemplate4() {
        const routes = this.getSlotValue('routes4');
        
        const text = `帮我把下列跑山/越野线路改写为短视频标题, 可以是(某地)跑山/越野必打卡+线路名、(某地)经典线路+线路名、线路名+跑山/越野指南. 完全按我给你的顺序输出, 不需要加序号, 每行之间不需要空格. 每一个标题的前面如果有了(某地)名称, 写路线时就不需要再重复一次(某地)名, 同理路线两个字也是, 一个标题中不要重复出现, 每个标题字数小于30字, 以下是线路列表${routes}`;
        
        this.copyToClipboard(text, 4);
    },

    // 复制提示词模板5
    copyPromptTemplate5() {
        const count = this.getSlotValue('count5');
        const theme = this.getSlotValue('theme5');
        const aspects = this.getSlotValue('aspects5');
        const type = this.getSlotValue('type5');
        const exclude = this.getSlotValue('exclude5');
        
        const text = `帮我构思${count}条吸睛又有悬念的短视频标题, 主要聚焦于${theme}主题. 可以从${aspects}等多方面构思. 注意是${type}, 不要涉及${exclude}.`;
        
        this.copyToClipboard(text, 5);
    },

    // 复制提示词模板6
    copyPromptTemplate6() {
        const count = this.getSlotValue('count6');
        const price = this.getSlotValue('price6');
        const energy = this.getSlotValue('energy6');
        const body = this.getSlotValue('body6');
        const compare = this.getSlotValue('compare6');
        const minLen = this.getSlotValue('minlen6');
        const maxLen = this.getSlotValue('maxlen6');
        
        const text = `你是一个小红书汽车内容创作者，擅长写爆款标题。\n请帮我生成${count}个汽车对比类标题，要求：\n【填空参数】\n- 价格区间：${price}\n- 能源类型：${energy}\n- 车身类型：${body}\n【核心要求】\n- 每个标题对比${compare}款同价格区间的车\n- 标题长度控制在${minLen}-${maxLen}字之间\n- 标题要有钩子，能吸引点击（用疑问、悬念、冲突、对比等手法）\n【禁止事项】\n- 禁止罗列参数（如轴距xxxmm、续航xxx公里、功率xxx匹）\n- 禁止使用专业导购话术（如"性价比之王"、"值得入手"、"同级标杆"）\n- 禁止出现#标签\n- 禁止出现「线下体验」、「提车」、「实测」、「试车」、「试驾」、「买车」等关键词\n【风格参考】\n   - "纠结党进！Model 3和极氪007怎么选？差价2万值不值"\n   - "同事说小米SU7，我觉得不及特斯拉Model 3"\n   - "同样是20万预算，为什么有人选轿车有人选SUV"\n【输出格式】\n直接输出标题，每行一个，无需序号`;
        
        this.copyToClipboard(text, 6);
    },

    // 复制提示词模板7
    copyPromptTemplate7() {
        const minWords = this.getSlotValue('minwords7');
        const maxWords = this.getSlotValue('maxwords7');
        const hotWords = this.getSlotValue('hotwords7');
        const example = this.getSlotValue('example7');
        const titles = this.getSlotValue('titles7');
        
        const text = `你是一个小红书汽车博主，说话风格像抖音/贴吧网友，非常真人感。\n我会给你几个标题，请为每个标题写一篇对比文案。\n【写作要求】\n1. 字数：${minWords}-${maxWords}字\n2. 风格：真人感、口语化，像朋友聊天，不是营销号\n3. 可以带网络热词（如：${hotWords}等）\n4. 内容：\n   - 要有主观评价, 可以不说优点（锐评）\n   - 不要列车辆参数（马力、扭矩、零百等）\n   - 不要说"我去线下试驾了/实际体验过"，改成"我感觉/我看来/我觉得"\n5. 结构：\n   - 开头：简短引入（1-2句）\n   - 中间：对比两款车的感受（可以说A好在哪、B好在哪、或者A比B强在哪）\n   - 结尾：给购买建议（适合什么人买）\n6. 不需要加#话题标签\n【示例风格】\n"${example}"\n请根据以下标题生成文案：\n${titles}`;
        
        this.copyToClipboard(text, 7);
    },

    // 复制提示词模板8
    copyPromptTemplate8() {
        const count = this.getSlotValue('count8');
        const price = this.getSlotValue('price8');
        const energy = this.getSlotValue('energy8');
        const body = this.getSlotValue('body8');
        const minLen = this.getSlotValue('minlen8');
        const maxLen = this.getSlotValue('maxlen8');
        
        const text = `你是一个小红书汽车内容创作者，擅长用真实主观感受写爆款标题。\n请帮我生成${count}个汽车类标题，要求：\n【填空参数】\n- 价格区间：${price}\n- 能源类型：${energy}\n- 车身类型：${body}\n【核心要求】\n1. 每个标题只涉及1款车型，不对比其他车型\n2. 表达个人主观看法，非配置罗列、非选买推荐、非专业测评\n3. 从用车场景（通勤/家用/自驾/停车）、预算范围、适用人群（单身/情侣/家庭/新手）任一角度出发\n4. 字数控制在${minLen}-${maxLen}字之间\n5. 情感可以是正面（喜爱/认可）或负面（吐槽/失望）任选其一，负面需暗示具体理由，不要正负面都写\n【禁止事项】\n- 禁止罗列参数（如轴距xxxmm、续航xxx公里、功率xxx匹）\n- 禁止使用专业导购话术（如"性价比之王"、"值得入手"、"同级标杆"）\n- 禁止出现#标签\n- 禁止出现「线下体验」、「提车」、「实测」、「试车」、「试驾」等关键词\n【风格参考】\n- "理想L7开了一个月，发现最大的问题是老婆不坐副驾了"\n- "卡罗拉双擎就是想要个不花哨的代步工具，别跟我谈智能化"\n- "20万买Model 3，毛坯房内饰看久了居然有点上瘾"\n- "比亚迪海鸥治好了我的停车焦虑"\n【输出格式】\n直接输出标题，每行一个，无需序号`;
        
        this.copyToClipboard(text, 8);
    },

    // 复制到剪贴板
    copyToClipboard(text, templateNum) {
        navigator.clipboard.writeText(text).then(() => {
            dataManager.showToast('提示词已复制到剪贴板');
        }).catch(() => {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            dataManager.showToast('提示词已复制到剪贴板');
        });
    }
};
