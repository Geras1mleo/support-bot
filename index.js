import {Markup, Telegraf} from 'telegraf'
import {message} from 'telegraf/filters'
import {questions} from './questions.js'

const bot = new Telegraf(process.env.BOT_TOKEN)

const defaultResponse = ctx => {
    console.log(ctx.update.message)
    return ctx.reply(
        "Виберіть питання яке вас цікавить:",
        Markup.keyboard(Object.keys(questions)),
    );
};

const questionResponse = async ctx => {
    console.log(ctx.update.message);

    const question = questions[ctx.message.text];

    if (question.files) {
        await ctx.telegram.sendMediaGroup(ctx.chat.id, question.files.map(file => {
            return {
                type: "photo",
                media: file
            }
        }))
    }

    return ctx.replyWithMarkdown(
        question.answer,
        Markup.keyboard(Object.keys(questions)),
    );
}

bot.start(defaultResponse);
bot.on(message("text"), ctx => ctx.message.text in questions ? questionResponse(ctx) : defaultResponse(ctx));

bot.on("message", ctx => {
    console.log(ctx.update.message);
})

bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))