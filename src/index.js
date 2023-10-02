import {Markup, Telegraf} from 'telegraf'
import {callbackQuery, message} from 'telegraf/filters'
import {questions} from './questions.js'
import {getUsers, addUser} from "./users.js";

const bot = new Telegraf(process.env.BOT_TOKEN)

const users = getUsers();

bot.start(startChat);
bot.on(message("text"), ctx => ctx.message.text in questions ? questionResponse(ctx) : unknownQuestionResponse(ctx));

bot.on(callbackQuery("data"), answerCbQuery)

bot.on("message", ctx => {
    console.log(ctx.update.message);
})

bot.launch()

bot.catch((e, ctx) => {
    console.log(e, ctx)
})

console.log("Bot started!", bot.botInfo)

function startChat(ctx) {
    // console.log("Start:", ctx.update.message)

    addUser({
        id: ctx.update.message.from.id,
        firstName: ctx.update.message.from.first_name,
        lastName: ctx.update.message.from.last_name
    }, users);

    return ctx.reply(
        "Натисніть на цю кнопку щоб взнати більше⬇⬇",
        {
            ...Markup.keyboard(Object.keys(questions)),
            ...Markup.inlineKeyboard([Markup.button.callback("Вибрати запитання", "question")])
        }
    )
}

function unknownQuestionResponse(ctx) {
    console.log("Unknown question:", ctx.update.message)
    return ctx.reply(
        "Виберіть питання яке вас цікавить:",
        Markup.keyboard(Object.keys(questions)),
    );
}

async function sendFiles(files, ctx) {
    const chunkSize = 10;
    for (let i = 0; i < files.length; i += chunkSize) {
        const chunk = files.slice(i, i + chunkSize);
        await ctx.telegram.sendMediaGroup(ctx.chat.id,
            chunk.map(file => {
                return {
                    type: "photo",
                    media: file
                }
            }))
    }
}

async function answerCbQuery(ctx) {
    if (ctx.callbackQuery.data === "question") {
        await ctx.answerCbQuery();
        return ctx.telegram.sendMessage(ctx.callbackQuery.from.id, "❓", Markup.keyboard(Object.keys(questions)))
    }
}

function constructInlineButtons(buttons) {
    const markupButtons = [buttons?.map(button => Markup.button.url(button.caption, button.url)) || []];
    markupButtons.push([Markup.button.callback("Вибрати запитання", "question")]) // TODO
    return Markup.inlineKeyboard(markupButtons)
}

async function questionResponse(ctx) {
    console.log(ctx.update.message);

    const question = questions[ctx.message.text];

    if (question.files) {
        await sendFiles(question.files, ctx);
    }

    return ctx.replyWithMarkdown(
        question.answer,
        {
            ...Markup.keyboard(Object.keys(questions)),
            ...constructInlineButtons(question.buttons),
        }
    );
}

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
