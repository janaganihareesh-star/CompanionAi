/**
 * RBAC (Role-Based Access Control) Middleware
 * Checks if a user has the required enterprise role to access a resource.
 */
const Team = require('../models/Team');

exports.requireRole = (requiredRole) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id; // Assumes auth middleware ran first
            const teamId = req.params.teamId || req.body.teamId;

            if (!teamId) {
                return res.status(400).json({ error: 'Team ID is required for this action' });
            }

            const team = await Team.findById(teamId);
            if (!team) {
                return res.status(404).json({ error: 'Team not found' });
            }

            const member = team.members.find(m => m.user.toString() === userId);
            if (!member) {
                return res.status(403).json({ error: 'You are not a member of this team' });
            }

            const roles = ['viewer', 'member', 'manager', 'admin'];
            const userRoleLevel = roles.indexOf(member.role);
            const requiredRoleLevel = roles.indexOf(requiredRole);

            if (userRoleLevel < requiredRoleLevel) {
                return res.status(403).json({ error: 'Insufficient permissions' });
            }

            req.team = team;
            req.memberRole = member.role;
            next();
        } catch (error) {
            console.error('RBAC Error:', error);
            res.status(500).json({ error: 'Internal server error during authorization' });
        }
    };
};
