// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, MessageFactory } = require('botbuilder');

class Bot extends ActivityHandler {
    constructor(dialog) {
        super();

        if (!dialog) throw new Error('[DialogBot]: Missing parameter. dialog is required');

        this.dialog = dialog;
        this.echoEnabled = false;

        this.onMessage(async (context, next) => {
            if (context.activity.text.includes('Echo enabled')) this.echoEnabled = true;
            if (context.activity.text.includes('Echo disabled')) this.echoEnabled = false;

            if (this.echoEnabled) {
                const replyText = `Echo: ${ context.activity.text }`;

                await context.sendActivity(MessageFactory.text(replyText, replyText));
            } else {
                await context.sendActivity(MessageFactory.text("1", "1"));
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    const welcomeText = `Welcome to Premiumy Dialog Bot ${ membersAdded[cnt].name }. This bot provides a allocation.`;
                    await context.sendActivity(reply);
                    await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
                }
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }
}

module.exports.Bot = Bot;
