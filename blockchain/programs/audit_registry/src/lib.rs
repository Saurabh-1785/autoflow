use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod audit_registry {
    use super::*;

    pub fn log_record(
        ctx: Context<LogRecord>, 
        record_id: String, 
        content_hash: String, 
        ipfs_cid: String, 
        event_type: String
    ) -> Result<()> {
        msg!("Record Logged: {}", record_id);
        msg!("Content Hash: {}", content_hash);
        msg!("IPFS CID: {}", ipfs_cid);
        msg!("Event Type: {}", event_type);
        msg!("Actor: {}", ctx.accounts.actor.key());
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct LogRecord<'info> {
    #[account(mut)]
    pub actor: Signer<'info>,
}
