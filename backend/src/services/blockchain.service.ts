import { Connection, Keypair, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import bs58 from 'bs58';
import crypto from 'crypto';
import axios from 'axios';
import { query } from '../db/client';

export function hashDocument(data: object): string {
  const jsonStr = JSON.stringify(data);
  return crypto.createHash('sha256').update(jsonStr).digest('hex');
}

export async function uploadToIPFS(content: string): Promise<string> {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) return 'NO_IPFS_CONFIGURED';
  try {
    const res = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      pinataContent: { content }
    }, {
      headers: { Authorization: `Bearer ${jwt}` }
    });
    return res.data.IpfsHash;
  } catch (error) {
    console.error('IPFS Upload Error:', error);
    return 'IPFS_UPLOAD_FAILED';
  }
}

export async function logToBlockchain(recordId: string, data: object, eventType: string): Promise<string> {
  const hash = hashDocument(data);
  const cid = await uploadToIPFS(JSON.stringify(data));
  
  if (!process.env.SOLANA_RPC_URL || !process.env.AGENT_PRIVATE_KEY || !process.env.PROGRAM_ID) {
    console.warn('Blockchain config missing, simulating txHash');
    
    // Save to audit log anyway as a fallback
    await query(
      `INSERT INTO audit_log (record_id, event_type, content_hash, ipfs_cid, tx_hash, actor)
       VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (record_id) DO NOTHING`,
      [recordId, eventType, hash, cid, 'SIMULATED_TX_HASH', 'system']
    );
    return 'SIMULATED_TX_HASH';
  }

  try {
    const connection = new Connection(process.env.SOLANA_RPC_URL, 'confirmed');
    const secretKey = bs58.decode(process.env.AGENT_PRIVATE_KEY);
    const keypair = Keypair.fromSecretKey(secretKey);
    const programId = new PublicKey(process.env.PROGRAM_ID);

    const payload = Buffer.from(JSON.stringify({ recordId, contentHash: hash, ipfsCid: cid, eventType }));
    
    const instruction = new TransactionInstruction({
      keys: [{ pubkey: keypair.publicKey, isSigner: true, isWritable: true }],
      programId,
      data: payload,
    });

    const transaction = new Transaction().add(instruction);
    const signature = await connection.sendTransaction(transaction, [keypair]);
    await connection.confirmTransaction(signature);

    await query(
      `INSERT INTO audit_log (record_id, event_type, content_hash, ipfs_cid, tx_hash, actor)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [recordId, eventType, hash, cid, signature, keypair.publicKey.toString()]
    );

    return signature;
  } catch (error) {
    console.error('Blockchain Tx Error:', error);
    await query(
      `INSERT INTO audit_log (record_id, event_type, content_hash, ipfs_cid, tx_hash, actor)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [recordId, eventType, hash, cid, 'PENDING_RETRY', 'system']
    );
    return 'PENDING_RETRY';
  }
}

export async function verifyOnChain(recordId: string, currentData: object): Promise<boolean> {
  if (!process.env.SOLANA_RPC_URL || !process.env.PROGRAM_ID) {
    return true; // Simulate true in dev mode if no config
  }
  const currentHash = hashDocument(currentData);
  // Simple mock verification for hackathon. 
  // In production, fetch PDA account data from Solana and compare hashes.
  return true;
}
