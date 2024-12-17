use anchor_lang::prelude::*;

declare_id!("J5EGAnhY5LRwbRZC5tWXnxjKqtbc6URC88Xnv69yn1Nj");

pub const ANCHOR_DICIRIMINATOR_SIZE: usize = 8;

#[program]
pub mod message {
    use super::*;

    pub fn set_message(ctx: Context<SetMessage>, new_message: String) -> Result<()> {
        msg!("Hey from {}", ctx.program_id);
        let user = ctx.accounts.user.key();

        msg!("Users address is: {}, Your new message is {}", user, new_message);

        ctx.accounts.message.set_inner(Message { message: new_message });

        Ok(())
    }
}

#[account]
#[derive(InitSpace)]
pub struct Message {
    #[max_len(50)]
    pub message: String,
}

#[derive(Accounts)]
pub struct SetMessage<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init_if_needed,
        payer = user,
        space = ANCHOR_DICIRIMINATOR_SIZE + Message::INIT_SPACE,
        seeds = [b"message", user.key().as_ref()],
        bump
    )]
    pub message: Account<'info, Message>,
    pub system_program: Program<'info, System>,
}
