import type { Response } from 'express';

/**
 * Resultado que um Controller devolve para uma rota renderizar. Só existe
 * a variante "render" por enquanto — o template ainda não tem nenhum caso
 * de uso que termina em redirecionamento. Quando vocês implementarem
 * `POST /cards` (Atividade 1), muito provavelmente vão querer redirecionar
 * de volta para `/` após o sucesso (padrão Post/Redirect/Get); estender
 * este tipo (ou usar `res.redirect` diretamente na rota) faz parte da
 * atividade — é uma decisão de vocês, não deste template.
 * 
 * Atualização em 22\8\2026
 * O que mudou: O tipo ControllerResult foi estendido com RedirectResult, 
 * e a função respond passou a tratar casos com redirectTo além de chamadas para render.
 *  Também foi adicionada a função auxiliar redirect().  
 * 
 * Por que mudou: O template inicial só suportava renderização direta de views. 
 * Como a criação de um cartão segue o padrão web PRG (Post/Redirect/Get) — 
 * evitando reenvio de formulário ao atualizar a página —, o controller precisava de 
 * um meio tipado para instruir o Express a realizar um res.redirect('/') sem quebrar 
 * o retorno do BoardController.
 */

export interface RenderResult {
  status: number;
  view: string;
  locals: Record<string, unknown>;
}

export interface RedirectResult {
  status?: number;
  redirectTo: string;
}

export type ControllerResult = RenderResult | RedirectResult;

export function redirect(url: string, status = 302): RedirectResult {
  return { redirectTo: url, status };
}

export function respond(res: Response, result: ControllerResult): void {
  if ('redirectTo' in result) {
    res.redirect(result.status ?? 302, result.redirectTo);
    return;
  }

  res.status(result.status).render(result.view, result.locals);
}
