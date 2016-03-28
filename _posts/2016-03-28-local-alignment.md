---
layout: post
title: "Blog"
post_title: "Visualizing the Smith Waterman Local Alignment Algorithm"
date: 2016-03-27
image_source: /resources/local_alignment_visual/example.png
excerpt: "A d3 visualization of the Smith Waterman Local Alignment Algorithm"
comments: "true"
---

<script type="text/javascript" src="../../../resources/local_alignment_visual/d3/d3.min.js"></script>
<script type="text/javascript" src="../../../resources/local_alignment_visual/local_alignment_algo.js"></script>
<script type="text/javascript" src="../../../resources/local_alignment_visual/local_alignment_visual.js"></script>


This is an interactive [d3](https://d3js.org/) visualization of the Smith-Waterman local
alignment algorithm. If you never heard of it you can scroll down and read the
explanation of the algorithm. 

To use the visualization tool, enter the two sequences you want to align in the fields below. A **Match Score** is added to the alignment when two sequence
elements match. The **Mismatch Score** is the penalty if the alignment contains
two elements that don't match, and the **Gap Score** is the penalty for each gap
that is introduced to one of the sequences. 

You can use the defaults or fill in your own sequences and parameters in the fields below. Click on **Generate Matrix** to see the alignment matrix below. Sequence elements must be separated by white space. Each cell displays the score of the optimal alignment that ends with the corresponding combination of sequence elements. The lines allow you to back trace this alignment: **if you click on one of the cells the corresponding alignment is
displayed** on the right side of the matrix, and its evolution is highlighted in
the matrix. Try it out!

<div id="laFrame">
    <form name="parameters" onSubmit="return handleFormSubmission()">
        <table>
            <tr>
                <td>Sequence 1</td>
                <td><input type="text" id="seq_1" value="a b c d e f g"></td>
                <td><input name="Submit" type="submit" value="Generate Matrix"></td> 
            </tr>
            <tr>
                <td>Sequence 2</td>
                <td> <input type="text" id="seq_2" value="a b c x d e x g"> </td>
                <td></td>
            </tr>
            <tr>
                <td>Match Score</td>
                <td><input type="text" id="match" value="3"></td>
                <td></td>
            </tr>
            <tr>
                <td>Mismatch Score</td>
                <td><input type="text" id="misMatch" value="-2"></td>
                <td></td>
            </tr>
            <tr>
                <td>Gap Score</td>
                <td><input type="text" id="gap" value="-1"></td>
                <td></td>
            </tr> 
        </table>
    </form>
    
    <script type="text/javascript"> handleFormSubmission() </script>
    <p></p> 
</div> 

<p></p>
<p></p>
If you are interested in the code you can find it on my [GitHub](https://github.com/flinder/local_alignment_visual).
<p></p>

#### The Algorithm
<hr/>

The  algorithm was developed by [Smith and Waterman](http://dornsife.usc.edu/assets/sites/516/docs/papers/msw_papers/msw-014.pdf) in 1981 to find matching molecular subsequences in proteins. Given two sequences, the algorithm calculates the optimal match between those sequences, called an alignment. It is called a *local* alignment algorithm because it can return just sub sections of the sequences as compared to global alignment where the complete sequences are aligned. Many sequences that we want to align (e.g. DNA sequences, text strings, etc.) do not match perfectly. Formatting, white space, typographical errors, etc. hinder the detection of otherwise homologous matches. The Smith-Waterman algorithm returns the optimal alignment while allowing for mismatches and gaps. The extent to which such imperfections are tolerated is governed by exogenous parameters that are set by the researcher. There are three such parameters, the match score, the mismatch score and the gap score. The goal of the algorithm is to return the alignment with the highest score given the input sequences and parameters.

##### Intuition

Because there are *a lot* of possibilities for local alignments, we rely on a dynamic programming approach to calculate the optimal local alignment given the parameters. Dynamic programming means that results of previous calculations are stored and used in later calculations. This works in our case, because every alignment's score is a function of the characters that are aligned before it. To make this a bit clearer consider the two example sequences from the visualization above:

<blockquote>
<p class="entry"><b>s1:</b>  a b c d e f g</p>
<p class="entry"><b>s2:</b>  a b c x d e x g</p>
</blockquote>

Let's consider the first four letters of the sequences above, ending in "d" in S1 and "x" in S2. If we want to find the best alignment, we have to start at the end of this subsequence. The best alignment ending in these elements is also the best alignment for the previous sub-sequences ending in "c" and "c". This must be true, because if we had a sub-optimal alignment in the first three characters we could always improve the alignment of the first four characters by choosing a better one for the first three. For we know that the alignment

<blockquote>
<p class="entry"><b>s1:</b>  a b - c d</p>
<p class="entry"><b>s2:</b>  a b c - x</p>
</blockquote>

is not optimal, because it is not optimal in the first three characters (the "-"
indicate a gap, and we introduced two unnecessary gaps). Therefore, if we know
that the optimal alignment of the first three elements is,

<blockquote>
<p class="entry"><b>s1:</b>  a b c</p>
<p class="entry"><b>s2:</b>  a b c</p>
</blockquote>

we can exclude from consideration all alignments that do not start with this
alignment. So when considering where to go from here, we just have to decide if
we want to accept the mismatch "d"-"x", introduce a gap in sequence 1 or
sequence 2, or end the alignment here (keep these four steps in mind). This is a
n easy decision since we have set parameters that increase or decrease our total
alignment score depending on which step we chose (the match, mismatch and gap
parameters).

If the next two elements match, the decision is easy - we add them and increase
the total alignment score. However, if they don't match the decision is more
difficult. We only want to introduce a gap or mismatch, if it pays off later
(that is if we thereby can 'reach' another part of the sequence that matches
again). We only know that, when we went through the whole sequence. The central
idea is therefore to find all optimal alignments ending in all possible spots,
keep these scores and after everything is calculated find the highest score. 


##### Formalization

In order to systematically do this, we create a matrix (the matrix you see in the visualization above) where each combination of elements of the two sequences is assigned a cell. Denote the two sequences as $$\mathcal{A} = (a_1, a_2, ... a_n)$$ and $$\mathcal{B} = (b_1, b_2, ..., b_k)$$. Now each cell with row and column indices $$i$$ and $$j$$ corresponds to an alignment that ends in $$a_i$$ and $$b_j$$. 

The first step to finding the optimal alignment is filling the scoring matrix. Let $$\delta$$, $$\epsilon$$ and $$\gamma$$ be the match, mismatch and gap scores. Define the scoring function:

\begin{equation}
        \label{eqn:scoring}
        S(a_i, b_j) = \delta^{\mathbb{I}(a_i = b_j)} + \epsilon^{\mathbb{I}(a_i \neq b_j)}
\end{equation} 

Where $$\mathbb{I}(.)$$ is the indicator function which returns $$1$$ if the condition is true and $$0$$ otherwise. In words, this function returns the match score if the elements match and the mismatch score otherwise.

Then the entry for each cell $$M_{i,j}$$, $$i=1,2,...,n$$ and $$j=1,2,...,k$$ of the matrix is filled by the following recursive function:

\begin{equation}
        \label{eqn:fill}
        M_{i,j} = \max(M_{i-1,j-1} + S(a_i, b_j), M_{i-1,j} + \gamma, M_{i,j-1} + \gamma, 0)
\end{equation}

The matrix is initialized empty with just a leading row of zeros and a leading column of zeros. In order to be able to insert gaps in the beginning of each sequence (or mathematically so $$M_{i-1,j-1}$$ always exists). Now we start in the upper left corner of the matrix and begin filling the cells according to the second equation. The first entry in the $$\max()$$ expression corresponds to a diagonal step, from $$M_{i-1,j-1}$$ to $$M_{i,j}$$. If this step would be taken, elements $$i$$ and $$j$$ would be matched in the resulting alignment. If the two elements are equal the new score is the old one plus the match score if not the mismatch penalty is subtracted. The second and third entry correspond to an insertion of a gap in Sequence 1 or Sequence 2 respectively; or in the matrix moving one step to the right or one step down. Go back up to the matrix and check it out. You can see it by clicking on a cell, and then click on the adjacent cells above and on the left. If all scores are smaller or equal than zero, zero is filled into the cell. While filling the matrix with scores, we also keep track of the history of the alignment. That is, we store, which step was taken to fill a cell (from the left, the top, diagonally or no step when zero is filled in). In the visualization this is indicated by the lines pointing upwards, to the left or to the upper left corner of the cell. 

Once the matrix is filled, we scan it for the highest score. The optimal alignment is then found by following the lines until we hit a cell with a zero or the first element in one of the sequences. You can explore different alignments in the visualization by clicking on cells. The alignment will be displayed on the right and the relevant cells will be highlighted.
