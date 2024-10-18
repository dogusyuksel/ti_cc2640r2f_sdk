/**
 * Send an email with the given config.
 *
 */
export function sendEmail({ receiver, subject, payload, attachments, sender, html }: {
    receiver: any;
    subject: any;
    payload: any;
    attachments: any;
    sender?: string | undefined;
    html?: boolean | undefined;
}, callback?: () => void): NodeJS.Immediate | undefined;
export var _object: typeof HelpersNode;
declare class HelpersNode {
    /**
     * Send an email with the given config.
     *
     */
    static sendEmail({ receiver, subject, payload, attachments, sender, html }: {
        receiver: any;
        subject: any;
        payload: any;
        attachments: any;
        sender?: string | undefined;
        html?: boolean | undefined;
    }, callback?: () => void): NodeJS.Immediate | undefined;
}
export {};
