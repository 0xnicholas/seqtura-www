import type { APIRoute } from 'astro';
import { handleContactOptions, handleContactRequest } from '../../contact/handler';

export const prerender = false;

export const POST: APIRoute = ({ request, clientAddress }) =>
  handleContactRequest(request, { clientAddress });

export const OPTIONS: APIRoute = ({ request }) => handleContactOptions(request);
