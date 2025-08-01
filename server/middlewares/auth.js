import { clerkClient } from '@clerk/express';

export const auth = async (req, res, next) => {
  try {
    const { userId, has } = await req.auth();
    const hasPremiumPlan = await has({ plan: 'premium' });
    const user = await clerkClient.users.getUser(userId);

    if (!hasPremiumPlan && user.privateMetadata.free_usage) {
      req.free_usage = user.privateMetadata.free_usage;
    } else {
      await clerkClient.users.updateUser(userId, {
        privateMetadata: {
          free_usage: 0
        }
      });
      req.free_usage = 0;
    }

    req.plan = hasPremiumPlan ? 'premium' : 'free';
    next(); // ✅ only one call to next here

  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};
