import type { Request, Response, NextFunction } from 'express';

/**
 * checks if a playlist template exists
 * returns 404 if it does not,
 * returns 500 if an error occurs,
 * returns next if the playlist template exists and adds the playlist template to the request body
 * @param input.getTemplateFunction - function to get a playlist template
 */
export const checkPlaylistTemplate = (input: { getPlaylistTemplateFunction: Promise<PlaylistTemplateDocument>}): any => {
    const { getPlaylistTemplateFunction } = input;

    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { playlistTemplate_id } = req.body;

        if (!playlistTemplate_id) {
            req.body.usePlaylistTemplate = false;
            next();
        }

        try {
            const playlistTemplate = await getPlaylistTemplateFunction({ playlistTemplate_id: playlistTemplate_id });

            if (!playlistTemplate) {
                return res.status(404).json({ error: 'Playlist template not found' });
            }

            req.body.usePlaylistTemplate = true;
            req.body.playlistTemplate = playlistTemplate;

        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch playlist template' });
        }
        next();
    };
};