module.exports = {
    keyboardREV: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'Начнем заново', callback_data: '/repeat'}]
            ]
        })
    },
    
    keyboardREP: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'Начнем заново', callback_data: '/repeatDialog'}]
            ]
        })
    },
    
    keyboardSTART: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'Начинаем', callback_data: '/startDialog'}]
            ]
        })
    },

    keyboard: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'ДА', callback_data: '/QWERTY'}, {text: 'НЕТ', callback_data: '/NOOO'}],
            ]
        })
    },

    keyboardGOTOVO: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'Готово✅', callback_data: '/GOTOVO'}],
            ]
        })
    }

}
