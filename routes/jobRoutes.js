import express from 'express';
import {
    addJob,
    getSingleJob,
    getJobs,
    updateJob,
    deleteJob
} from '../controllers/jobController'
import authorize from '../middlewares/authorize';

const router = express.Router();

router.post('/add', authorize(['ADMIN','CLIENT']), addJob);
router.get('/:id', getSingleJob);
router.get('/', getJobs);
router.put('/:id', authorize(['ADMIN', 'CLIENT']), updateJob);
router.delete('/:id', authorize(['ADMIN', 'CLIENT']), deleteJob);

export default router;