---
title: LeetCode Prob.1 Two sum
category: leetcode
tags: array hashtable
date: 2022-07-13 15:58:00
---

# Problem statement
Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.

Assume that there is exactly one solution, and that each integer can be used only once.

The answer may be returned in any order.
 
Example 1:
```
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, [0, 1] is returned.
```
 
Example 2:
```
Input: nums = [3,2,4], target = 6
Output: [1,2]
```
 
Example 3:
```
Input: nums = [3,3], target = 6
Output: [0,1]
```
___

# Solution
Intuitively, we can use brute force method to add each pair of the numbers in the array by iterating twice and compare the sum with `target`, whose time complexity is $$O(n^2)$$ and space complexity is $$O(1)$$. 

By maintaining a hash table, however, the time complexity may be decreased to $$O(n)$$ with a tradeoff of $$O(n)$$ space. To achieve that, we create a map from the values that each number in `nums` differs from `target`, to the index of each number for further search, i.e., we maintain a hash with the difference as the key and the index as the value. Then, we can iterate `nums` once again and search the hash for `rvalues[nums[i]]` by the random access and there will be two results:
1. `rvalues` has no key `nums[i]`, which means there is no value `nums[j]` such that `nums[i] + nums[j] = target`.
2. `rvalues` has a key `nums[i]`, then the task is done and the expected indices are `i` and `rvalues[nums[i]]` such that `j = rvalues[nums[i]], nums[i] + nums[j] = target`.

___

# Gist codes
The following is an example C++ codes.
{% gist bfef8090a4f22dfd7a0868ebd7f83599 leetcode_p1_two_sum.cpp %}